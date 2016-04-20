/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/polls              ->  index
 * POST    /api/polls              ->  create
 * GET     /api/polls/:id          ->  show
 * PUT     /api/polls/:id          ->  update
 * DELETE  /api/polls/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Poll from './poll.model';

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
        if (entity) {
            res.status(statusCode).json(entity);
        }
    };
}

function saveUpdates(updates) {
    return function(entity) {
        var updated = _.merge(entity, updates);
        return updated.saveAsync()
            .spread(updated => {
                return updated;
            });
    };
}

function removeEntity(res) {
    return function(entity) {
        if (entity) {
            return entity.removeAsync()
                .then(() => {
                    res.status(204).end();
                });
        }
    };
}

function handleEntityNotFound(res) {
    return function(entity) {
        if (!entity) {
            res.status(200).end({
                ok: false,
                message: 'Poll not found!',
                status: 404
            });
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(200).send({
            ok: false,
            message: err.message,
            status: statusCode,
            err: err
        });
    };
}

// Gets a list of Polls
export function index(req, res) {
    let currentUser = req.user._id;
    let query = {
        deleted: {
            $ne: true
        }
    };
    if(req.user.role !== 'admin') {
        query.$or = [
            {owner: currentUser},
            {public: true}
        ]
    }
    Poll.findAsync(query)
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Gets a single Poll from the DB
export function show(req, res) {
    Poll.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Poll in the DB
export function create(req, res) {
    Poll.createAsync(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

// Updates an existing Poll in the DB
export function update(req, res) {
    if (req.body._id) {
        delete req.body._id;
    }
    Poll.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(saveUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Poll from the DB
export function destroy(req, res) {
    Poll.findByIdAsync(req.params.id)
        .then(handleEntityNotFound(res))
        .then(removeEntity(res))
        .catch(handleError(res));
}
