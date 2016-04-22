'use strict';
const Poll = require('../../../models/poll.js');
exports.getAll = (req, res, next) => {
    Poll.find({
        deleted: {
            $ne: true
        }
        ,$or: [{
            publisher: req.user._id
        }, {
            public: true
        }]
    }, (err, polls) => {
        if (err) {
            return res.send({
                ok: false,
                message: 'Coudn\'t get polls'
            });
        }
        return res.send(polls);
    });
};
exports.get = (req, res, next) => {
    Poll.findOne({
            _id: req.params.id,
            deleted: {
                $ne: true
            }
        })
        .select('-deleted')
        .exec((err, poll) => {
            if (err) {
                return res.send({
                    ok: false,
                    message: 'Coudn\'t get the poll'
                });
            }

            if (!poll) {
                return res.send({
                    ok: false,
                    message: 'Coudn\'t get the poll'
                });
            }

            return res.send(poll);
        });
};

exports.create = (req, res, next) => {

};

exports.delete = (req, res, next) => {
    Poll.update({
        _id: req.params.id,
        publisher: req.user._id
    }, {
        $set: {
            updated: new Date(),
            deleted: true
        }
    }, (err, raw) => {
        if (err) {
            return res.send({
                ok: false,
                message: 'Coudn\'t delete the poll'
            });
        }
        return res.send({
            ok: true
        });
    });
};

exports.update = (req, res, next) => {

};
