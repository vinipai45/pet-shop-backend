const { Animal } = require("../models/animal");

exports.getAllAnimals = (req, res) => {
    Animal.find().exec((err, animals) => {
        if (err) return res.status(400).json({ error: "No animals found" });
        return res.json(animals);
    });
};

exports.createAnimal = (req, res) => {
    let animal = new Animal(req.body);
    animal.save((err, animal) => {
        if (err) return res.status(400).json({ error: "cannot save animal" });
        return res.json(animal);
    });
};