const Sauce = require('../models/sauce');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(err => res.status(400).json({ err }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(err => res.status(404).json({ err }));
};

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce)
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        likes: 0,
        dislikes: 0,
        usersLiked: [' '],
        usersdisLiked: [' '],
    });
    sauce
        .save()
        .then(() => res.status(201).json({ message: "Sauce enregistrée" }))
        .catch((error) => res.status(400).json({ error }));
};


exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifié!' }))
        .catch(err => res.status(400).json({ err }));
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const filename = sauce.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
                Sauce.deleteOne({ _id: req.params.id })
                    .then(() => res.status(200).json({ message: 'Sauce supprime!' }))
                    .catch(err => res.status(400).json({ err }));
            });
        })
        .catch(err => res.status(400).json({ err }));
};


exports.sauceLikeDislike = (req, res, next) => {
    const userId = req.body.userId;
    const like = req.body.like;
    const sauceId = req.params.id;

    if (like === 1) {
        Sauce.updateOne({ _id: sauceId }, {
            $push: { usersLiked: userId },
            $inc: { likes: +1 }
        })
            .then(() => res.status(200).json({ message: 'Sauce Liked!' }))
            .catch(err => res.status(400).json({ err }))
    } else if (like === -1) {
        Sauce.updateOne({ _id: sauceId }, {
            $push: { usersDisliked: userId },
            $inc: { dislikes: +1 }
        })
            .then(() => res.status(200).json({ message: 'Sauce Disliked!' }))
            .catch(err => res.status(400).json({ err }))
    } else if (like === 0) {
        Sauce.findOne({ _id: sauceId })
            .then((sauce) => {
                if (sauce.usersLiked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, {
                        $pull: { usersLiked: userId },
                        $inc: { likes: -1 }
                    })
                        .then(() => res.status(200).json({ message: 'Like suprime!' }))
                        .catch(err => res.status(400).json({ err }))
                } else if (sauce.usersDisliked.includes(userId)) {
                    Sauce.updateOne({ _id: sauceId }, {
                        $pull: { usersDisliked: userId },
                        $inc: { dislikes: -1 }
                    })
                        .then(() => res.status(200).json({ message: 'Dislike suprime!' }))
                        .catch(err => res.status(400).json({ err }))
                }
            })
            .catch(err => res.status(400).json({ err }))
    }
}