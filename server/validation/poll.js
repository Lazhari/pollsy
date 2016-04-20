'use strict';

import Joi from 'joi';

export let create = {
    options : { flatten : true },
    body: {
        title: Joi.string().required(),
        description: Joi.string().required(),
        type: Joi.any().tags(['single', 'multiple', 'satisfaction'])
    }
};
