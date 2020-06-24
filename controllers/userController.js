const createError = require("http-errors");
const User = require("../models/usersSchema");
const Event = require("../models/eventSchema");
const Workshop = require("../models/workshopSchema");
const Convention = require("../models/conventionSchema");
const { encrypt } = require("../lib/encryption");
const fetch = require("node-fetch");

const client_id = process.env.GITHUB_CLIENT_ID;
const client_secret = process.env.GITHUB_CLIENT_SECRET;

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find();
        res.json({ success: true, users: users })
    } catch (err) {
        next(err)
    }
}

exports.getUser = async (req, res, next) => {
    const { token } = req.header
    const { _id } = req.user
    // console.log('token:', token);
    try {
        const user = await User.findById(_id).populate('events').populate('favoriteMeetups').populate('favoriteWorkshops').populate('favoriteConventions').exec();
        res.json({ success: true, user: user })
    } catch (err) {
        next(err)
    }
}

//github login
// exports.getGithub = async (req, res, next) => {
//     const url = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=http://localhost:4000/users/login/github/callback`;
//     res.redirect(url);
// }

// //exchange code(expires after 10 minutes) for access token
// const getAccessToken = async (code) => {
//     const res = await fetch('https://github.com/login/oauth/access_token', {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             client_id,
//             client_secret,
//             code
//         })
//     });

//     //get a string of the access token, scope and token type
//     const data = await res.text();

//     //parse the string to separate them all
//     const params = new URLSearchParams(data);

//     //get only the access token
//     return params.get('access_token');
// }

// const getGithubUser = async (access_token) => {
//     const req = await fetch('https://api.github.com/user', {
//         headers: {
//             //bearer token generated by authentication server and used to get access token
//             Authorization: `bearer ${access_token}`
//         }
//     });

//     const data = await req.json();
//     return data;
// }

// exports.getGithubCallback = async (req, res, next) => {
//     try {
//         const code = req.query.code;
//         const token = await getAccessToken(code);
//         const githubData = await getGithubUser(token);
//         res.json(githubData);
//     }
//     catch (err) {
//         next(err);
//     }
// }

exports.postUser = async (req, res, next) => {
    try {
        const user = new User(req.body);
        const token = user.generateAuthToken();
        await user.save();
        const data = user.getPublicFields();
        res.header("x-auth", token).json({ success: true, user: data });
    } catch (err) {
        next(err);
    }
}

exports.putUser = async (req, res, next) => {
    const user = req.body;

    try {
        if (Object.keys(req.body).includes("password")) {
            const hashedPassword = await encrypt(user.password)
            user.password = hashedPassword
        }

        const updatedUser = await User.findByIdAndUpdate(req.user._id, user, { new: true }).populate("events");
        if (!updatedUser) throw createError(500)
        // console.log('updatedUser: ', updatedUser);

        res.json({ success: true, user: updatedUser })
    } catch (err) {
        next(err)
    }
}

exports.addFav = async (req, res, next) => {
    // const userId = req.user._id;
    const eventId = req.params.id;
    // console.log('PARAMS ID: ', eventId);

    try {
        let userData = await User.findById(req.user._id);
        const favMeetup = await Event.findById(eventId);
        const favWorkshop = await Workshop.findById(eventId);
        const favConvention = await Convention.findById(eventId);

        if (favMeetup) {
            const likedMeetup = userData.favoriteMeetups.filter(meetup => parseInt(meetup) === parseInt(eventId));
            // console.log('LIKED MEETUP: ', likedMeetup);
            if (likedMeetup.length === 0) {
                userData.favoriteMeetups.push(favMeetup);
                userData.save();
                console.log('Meetup WAS NOT THERE: ', favMeetup);
                res.json({ success: true, user: userData, star: true });
            } else {
                const newFavMeetups = userData.favoriteMeetups.filter(meetup => parseInt(meetup) !== parseInt(eventId));
                userData.favoriteMeetups = newFavMeetups;
                userData.save();

                // console.log('Meetup ALREADY THERE: ', favMeetup);
                res.json({ success: true, user: userData, star: false });
            }
        } else if (favWorkshop) {
            const likedWorkshop = userData.favoriteWorkshops.filter(workshop => parseInt(workshop) === parseInt(eventId));
            // console.log('LIKED WORKSHOP: ', likedWorkshop);
            if (likedWorkshop.length === 0) {
                userData.favoriteWorkshops.push(favWorkshop);
                userData.save();
                // console.log('Workshop WAS NOT THERE: ', favWorkshop);
                res.json({ success: true, user: userData, star: true });
            } else {
                const newFavWorkshops = userData.favoriteWorkshops.filter(workshop => parseInt(workshop) !== parseInt(eventId));
                userData.favoriteWorkshops = newFavWorkshops;
                userData.save();
                // console.log('Workshop ALREADY THERE: ', favWorkshop);
                res.json({ success: true, user: userData, star: false });
            }
        } else {
            const likedConvention = userData.favoriteConventions.filter(convention => parseInt(convention) === parseInt(eventId));
            // console.log('LIKED CONV: ', likedConvention);
            if (likedConvention.length === 0) {
                userData.favoriteConventions.push(favConvention);
                userData.save();
                console.log('Convention WAS NOT THERE: ', favConvention);
                res.json({ success: true, user: userData, star: true });
            } else {
                const newFavConventions = userData.favoriteConventions.filter(convention => parseInt(convention) !== parseInt(eventId));
                userData.favoriteConventions = newFavConventions;
                userData.save();
                console.log('Convention ALREADY THERE: ', favConvention);
                res.json({ success: true, user: userData, star: false });
            }
        }

    } catch (err) {
        next(err)
    }
}

exports.deleteUser = async (req, res, next) => {
    const eventId = req.header('eventId');
    console.log('EVENT ID: ', eventId);
    try {
        const user = await User.findByIdAndDelete(eventId)
        if (!user) throw createError(404)
        res.json({ success: true, user: user })
    } catch (err) {
        next(err)
    }
}

exports.login = async (req, res, next) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({ email })
        const valid = await user.checkPassword(password)
        if (!valid) throw createError(403)
        let token = user.generateAuthToken()
        const data = user.getPublicFields()

        res.header("x-auth", token).json({ success: true, user: data })
    } catch (err) {
        next(err)
    }
}