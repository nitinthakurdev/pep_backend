// job/FetchUserDataJob.js
import cron from 'node-cron';
import { UserModel } from '../Model/UserModel.js';

let UserData = new Map();

export function startUserDataJob() {
  if (UserData.size > 0) {
    cron.schedule('0 6 * * *', async () => {
      await FetchUserData();
    });
  } else {
    FetchUserData();
  }
}

async function FetchUserData() {
  try {
    const data = await UserModel.find({});
    const newMap = new Map();

    data.forEach(user => {
      newMap.set(user.username.toString(), {
        _id: user._id ,
        username: user.username,
        password: user.password,
        role:user.role
        // Add more fields if needed
      });
    });

    UserData = newMap; // Replace old map with new one
  } catch (err) {
    console.error('❌ Error fetching user data:', err);
  }
}

export function getUserData(username) {
  return UserData.get(username)
}
