'use strict';
const Poll = require('../../../models/poll.js');
const PollQueries = require('./lib/polls-queries');
/**
 * @api {get} /api/polls/ Get all polls
 * @apiVersion 0.1.0
 * @apiPermission admin, owner, guest
 * @apiName GetPolls
 * @apiGroup Poll
 */
exports.getAll = (req, res, next) => {
    PollQueries.getPolls({
            user: req.user
        })
        .then(polls => {
            return res.send(polls);
        })
        .catch(err => {
            return res.send({
                ok: false,
                message: 'Coudn\'t get polls'
            });
        });
};
/**
 * @api {get} /api/polls/:id Get poll by ID
 * @apiVersion 0.1.0
 * @apiPermission admin, owner, guest
 * @apiName GetPollById
 * @apiGroup Poll
 * @apiParam {ObjectId} id The poll id.
 */
exports.get = (req, res, next) => {
    PollQueries.getPoll({
            pollId: req.params.id
        })
        .then(poll => {
            return res.send(poll);
        })
        .catch(err => {
            return res.send({
                ok: false,
                message: 'Coudn\'t get the poll'
            });
        });
};

exports.create = (req, res, next) => {

};
/**
 * @api {delete} /api/polls/:id Delete poll by ID
 * @apiVersion 0.1.0
 * @apiPermission admin, owner
 * @apiName DeletePollById
 * @apiGroup Poll
 * @apiParam {ObjectId} id The poll id.
 */
exports.delete = (req, res, next) => {
    PollQueries.deletePoll({
            pollId: req.params.id,
            user: req.user
        }).then(poll => {
            return res.send({
                ok: true
            });
        })
        .catch((err) => {
            return res.send({
                ok: false,
                message: 'Coudn\'t delete the poll'
            });
        });
};

exports.update = (req, res, next) => {

};
