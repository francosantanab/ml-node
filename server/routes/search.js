//Dependencies
const express = require('express');
const app = express();
const request = require('request');
const _ = require('underscore');
const isDefinedType = require('is-defined-type');

//Middelwares
const { access } = require('../middelwares/access');

//Helper 
const utils = require('../helpers/helper');

app.get('/api/items', access, (req, res) => {
    let query = req.query.q;

    if (query)
    {
        request({
            url: `${utils.getUrl()}/sites/MLA/search?q=${query}&offset=0&limit=4`,
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
                let collection = utils.getCleanedProduct(response);
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
    }else
    {
        return res.status(400).json({
            ok: false,
            message: "You should provide a search query"
        });
    }

});


app.get('/api/items/:id', access, (req, res) => {

    let param = req.params.id;
    
    if (isDefinedType(param))
    {
        request({
            url: `${utils.getUrl()}/items/${param}`,
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

            if ((response) && (response.statusCode == 200))
            {
                request({
                    url: `${utils.getUrl()}/items/${param}/description`,
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

                    if ((resp)  && (resp.statusCode == 200))
                    {
                        let product = response.body;
                        let description = resp.body;

                        let item = utils.getCleanedFullProduct(product, description);
                        res.json(item);
                    }

                });
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

    }else
    {
        return res.status(400).json({
            ok: false,
            message: "You should provide a product id"
        });
    }
});

module.exports = app;
