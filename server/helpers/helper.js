const _ = require('underscore');
const isDefinedType = require('is-defined-type');

module.exports = {
    getUrl:function() {
        return 'https://api.mercadolibre.com';
    },
    getDecimal:function(price) {
        let position = String(price).indexOf('.');
        if (position === -1)
            return 0;

        let string = String(price).split(".")[1];

        if (string.length === 1)
        {
            string = `${string}0`;
        }
        return Number(string);
    },
    getCleanedProduct:function(response) {
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
                                         'thumbnail', 'condition', 'shipping', 'address']);
                let fill;

                if ((Object.keys(pick).length == 8) && (isDefinedType(pick.shipping.free_shipping)))
                {
                    fill = {
                        id: pick.id,
                        title: pick.title,
                        price: {
                            currency: pick.currency_id,
                            amount: Math.trunc(pick.price),
                            decimals: this.getDecimal(pick.price)
                        },
                        picture: pick.thumbnail,
                        condition: pick.condition,
                        free_shipping: pick.shipping.free_shipping,
                        seller_state: pick.address.state_name
                    }

                    collection.items.push(fill);
                }
                
            });

            let categories = [];
            _.each(response.body.filters, filter =>
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
            return collection;
    },
    getCleanedFullProduct:function(product, description) {
        let item;
        let fillable = _.pick(product, ['id', 'title', 'price', 'currency_id', 'condition', 'pictures', 'shipping', 'sold_quantity']);

        if ((Object.keys(fillable).length == 8) && (isDefinedType(fillable.shipping.free_shipping)) && (fillable.pictures[0].secure_url))
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
                        amount: Math.trunc(fillable.price),
                        decimals: this.getDecimal(fillable.price)
                    },
                    picture: fillable.pictures[0].secure_url,
                    condition: fillable.condition,
                    free_shipping: fillable.shipping.free_shipping,
                    sold_quantity: fillable.sold_quantity,
                    description: description.plain_text
                }
            }
        }

        return item;
    }
}

