const express = require('express');
const badData = require('./bad_data');
const bookingMade = require('./booking_made');
const callback = require('./callback')
const ghlAptBooked = require('./ghl_appointment_booked')
const ghlLoConversion = require('./ghl_lo_conversation')
const noShow = require('./ghl_no_show')
const ghlProspectReplied = require('./ghl_prospect_replied')
const ghltoVanillasoft = require('./ghl_to_vanillasoft_lead')
const liveTransfer = require('./live_transfer')
const noAnswer = require('./no_answer')


const router = express.Router();

router.post('/badData', badData);
router.post('/bookingMade', bookingMade);
router.post('/callback', callback);
router.post('/ghlAptBooked', ghlAptBooked);
router.post('/ghlLoConversion', ghlLoConversion);
router.post('/noShow', noShow);
router.post('/ghlProspectReplied', ghlProspectReplied);
router.post('/ghltoVanillasoft', ghltoVanillasoft);
router.post('/liveTransfer', liveTransfer);
router.post('/noAnswer', noAnswer);


module.exports = router;