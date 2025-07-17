// job/FetchUserDataJob.js
import cron from 'node-cron';
import { UserModel } from '../Model/UserModel.js';

let UserData = [];

export function startUserDataJob() {
  if (UserData.length > 0) {
    cron.schedule('0 6 * * *', async () => {
      FetchUserData();
    });
  } else {
    FetchUserData();
  }
}

async function FetchUserData() {
  try {
    const data = await UserModel.find({});
    UserData = data.sort((a, b) => a.username.localeCompare(b.username));
  } catch (err) {
    console.error('❌ Error fetching user data:', err);
  }
}

export function getUserData() {
  if (UserData.length > 0) return UserData;
}
