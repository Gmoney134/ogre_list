import cron from 'node-cron';
import House from './models/house.js';
import Room from './models/room.js';
import Appliance from './models/appliance.js';
import Part from './models/part.js';
import User from './models/user.js';
import { sendReminderEmail } from './utils/email.js';

// Schedule the task to run every hour
cron.schedule('*/05 * * * *', async () => {
    console.log('Running reminder check...');
    const now = new Date();

    try {
        // Check houses
        const houses = await House.findAllWithPastReminderDate(now);
        for (const house of houses) {
            const user = await User.findById(house.userId!);
            if (user) {
                await sendReminderEmail(user.email!, 'House Reminder', `Reminder for house: ${house.name}`);
                await House.updateHouse(house.id!, house.name!, house.yearBuilt, house.address, null, house.websiteLink);
            }
        }

        // Check rooms
        const rooms = await Room.findAllWithPastReminderDate(now);
        for (const room of rooms) {
            const house = await House.findById(room.houseId!);
            if (house) {
                const user = await User.findById(house.userId!);
                if (user) {
                    await sendReminderEmail(user.email!, 'Room Reminder', `Reminder for room: ${room.name}`);
                    await Room.updateRoom(room.id!, room.name!, room.description, room.squareFootage, null, room.websiteLink);
                }
            }
        }

        // Check appliances
        const appliances = await Appliance.findAllWithPastReminderDate(now);
        for (const appliance of appliances) {
            const room = await Room.findById(appliance.roomId!);
            if (room) {
                const house = await House.findById(room.houseId!);
                if (house) {
                    const user = await User.findById(house.userId!);
                    if (user) {
                        await sendReminderEmail(user.email!, 'Appliance Reminder', `Reminder for appliance: ${appliance.name}`);
                        await Appliance.updateAppliance(appliance.id!, appliance.name!, appliance.model, appliance.brand, appliance.purchaseDate, null, appliance.websiteLink);
                    }
                }
            }
        }

        // Check parts
        const parts = await Part.findAllWithPastReminderDate(now);
        for (const part of parts) {
            const appliance = await Appliance.findById(part.applianceId!);
            if (appliance) {
                const room = await Room.findById(appliance.roomId!);
                if (room) {
                    const house = await House.findById(room.houseId!);
                    if (house) {
                        const user = await User.findById(house.userId!);
                        if (user) {
                            await sendReminderEmail(user.email!, 'Part Reminder', `Reminder for part: ${part.name}`);
                            await Part.updatePart(part.id!, part.name!, null, part.websiteLink);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking reminders:', error);
    }
});