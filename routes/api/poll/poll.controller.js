'use strict'
const Poll = require('../../../models/poll.js');
exports.getAll = (req, res, next) => {
    Poll.find({
        publisher: req.user._id
        deleted: {
            $ne: true
        }
    }, (err, polls) => {
        if (err) {
            return res.send({
                ok: false,
                message: "Coudn't get polls"
            })
        }
        return res.send(polls);
    });
}
exports.get = (req, res, next) => {
    req.checkParams('id', 'The user id is invalid').isMongoId();
    let errors = req.validationErrors();
    if (errors) {
        return res.send({
            ok: false,
            message: errors[0].msg
        });
    } else {
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
                        message: "Coudn't get the poll"
                    });
                }

                if (!poll) {
                    return res.send({
                        ok: false,
                        message: "Coudn't get the poll"
                    });
                }

                return res.send(poll);
            });
    }
}

exports.create = (req, res, next) => {

}


exports.delete = (req, res, next) => {
    req.checkParams('id', 'Invalid Id').isMongoId();
    let errors = req.validationErrors();
    if (errors) {
        return res.send({
            ok: false,
            message: errors[0].msg
        });
    } else {
        Poll.update({
            _id: req.params.id,
            publisher: req.user._id
        }, {
            $set: {
                deleted: true
            }
        }, (err, raw) => {
            if (err) {
                return res.send({
                    ok: false,
                    message: "Coudn't delete the poll"
                });
            }
            return res.send({
                ok: true
            });
        });
    }
}

exports.update = (req, res, next) => {

}
