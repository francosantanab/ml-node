const express = require('express');
const app = express();

const request = require('request');
const _ = require('underscore');
const isDefinedType = require('is-defined-type');

app.get('/api/items', (req, res) => {
    let query = req.query.search;
    request({
        url: "https://api.mercadolibre.com/sites/MLA/search?q=".concat(query,'&offset=0&limit=4'),
        method: "GET",
        json: true,
    }, (error, response) => {
        if (error) {
            return res.status(500).json({
                ok: false,
                error
            });
        }
    
        if ((response) && (response.statusCode == 200))
        {
            let collection = {
                author: {
                    name: 'Franco',
                    lastname: 'Santana'
                },
                categories: [],
                items: []
            };
    
            _.each(response.body.results, item => 
            {
    
                let pick = _.pick(item, ['id', 'title', 'price', 'currency_id',
                                         'thumbnail', 'condition', 'shipping']);
                let fill;
                if ((Object.keys(pick).length == 7) && (isDefinedType(pick.shipping.free_shipping)))
                {
                    fill = {
                        id: pick.id,
                        title: pick.title,
                        price: {
                            currency: pick.currency_id,
                            amount: pick.price,
                            decimals: 0
                        },
                        picture: pick.thumbnail,
                        condition: pick.condition,
                        free_shipping: pick.shipping.free_shipping
                    }
                }
                
                collection.items.push(fill);
            });
    
            let categories = [];
            _.each(response.body.available_filters, filter => 
            {
                if ((isDefinedType(filter.id)) && (filter.id == 'category'))
                {
                    _.each(filter.values, category => 
                    {
                        if (category.name)
                        {
                            categories.push(category.name);
                        }
                    }); 
                }
            });
    
            collection.categories = categories;
            res.json(collection);
        }else
        {
            if (response) {
                return res.status(response.statusCode).json({
                    ok: false,
                    error: response.body.error
                });
            }
        }
        
    });
});


app.get('/api/items/:id', (req, res) => {
    let param = req.params.id;
    request({
        url: "https://api.mercadolibre.com/items/".concat(param),
        method: "GET",
        json: true,
    }, (error, response) => {

        if (error)
        {
            return res.status(500).json({
                ok: false,
                error
            });
        }

        request({
            url: "https://api.mercadolibre.com/items/".concat(param,'/description'),
            method: "GET",
            json: true,
        }, (err, resp) => {

            if (err)
            {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
        
            let product = response.body;
            let description = resp.body;
            let item;

            let fillable = _.pick(product, ['id', 'title', 'price', 'currency_id', 'condition', 'pictures', 'shipping', 'sold_quantity']);

            if (Object.keys(fillable).length == 8)
            {
                item = {
                    author: {
                        name: 'Franco',
                        lastname: 'Santana'
                    },
                    item : { 
                        id: fillable.id,
                        title: fillable.title,
                        price: {
                            currency: fillable.currency_id,
                            amount: fillable.price,
                            decimals: 0
                        },
                        picture: fillable.pictures[0].secure_url,
                        condition: fillable.condition,
                        free_shipping: fillable.shipping.free_shipping,
                        sold_quantity: fillable.sold_quantity,
                        description: description.plain_text
                    }
                }
            }

            res.json(item);
        });
       
    });
    
    
});
   
module.exports = app;