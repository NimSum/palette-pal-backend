const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../db');

router.post('/signup', (req, res) => {
	const { email, password, user_name } = req.body;
	const validUserName = typeof user_name === 'string' && user_name.trim() !== '';

	if (validateInputs(req.body) && validUserName) {
		getUser(email).then(user => {
			if (!user) {
				bcrypt.hash(password, 10).then(hash => {
					db('users').insert({ email, password: hash, user_name }, 'id').then(user_id => {
						addDefaultProject(user_id);
						res.status(201).json(...user_id);
					});
				});
			} else {
				res.status(400).json({ error: 'Email in use' });
			}
		}).catch(err => res.status(500).json(err));
	} else {
		res.status(403).json({ error: 'Invalid params, user_name, email, password required' });
	}
});

router.post('/login', (req, res) => {
	const { email, password } = req.body;

	if (validateInputs(req.body)) {
		getUser(email).then(user => {
			if (!user) {
				res.status(403).json({ error: 'Invalid login' });
			} else {
				bcrypt.compare(password, user.password).then(result => {
					if (result) {
						let options = {
							expiresIn: '7d'
						};
						jwt.sign({ user }, 'SECRETKEYGOESHERE', options, async (err, token) => {
							if (err) res.sendStatus(500);
							res.status(200).json({
								token,
								user_id: user.id,
								projects: await getUserData(user.id)
							});
						});
					} else res.status(403).json({ error: 'Invalid login' });
				});
			}
		});
	} else {
		res.status(403).json({ error: 'Invalid login' });
	}
});

function getUserData(userId){
	return db
		.raw(
			`SELECT usr.id AS user_id, proj.project_name, proj.id AS project_id, pal.palette_name, pal.id AS palette_id, pal.color_1, pal.color_2, pal.color_3, pal.color_4, pal.color_5 FROM palettes AS pal RIGHT JOIN projects AS proj ON pal.project_id = proj.id LEFT JOIN users AS usr ON usr.id = proj.user_id WHERE usr.id IN (${userId}) ORDER BY proj.updated_at`
		)
		.then(projects => {
			return projects.rows;
		});
}

async function addDefaultProject(userId){
	await db('projects').insert({ project_name: 'Uncategorized', user_id: parseInt(userId) });
}

function validateInputs(user){
	const validEmail = typeof user.email === 'string' && user.email.trim() !== '';

	const validPassword = typeof user.password === 'string' && user.password.trim() !== '' && user.password.length >= 6;

	return validEmail && validPassword;
}

function getUser(email){
	return db('users').where({ email }).first();
}

module.exports = { router, getUserData, getUser };
