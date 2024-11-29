// Visit developers.reddit.com/docs to learn Devvit!

import { Devvit } from '@devvit/public-api';

Devvit.configure({
  redditAPI: true,
});

Devvit.addSettings([
  {
    // Name of the setting which is used to retrieve the setting value
    name: 'open-ai-api-key',
    // This label is used to provide more information in the CLI
    label: 'Open AI API key',
    // Type of the setting value
    type: 'string',
    // Marks a setting as sensitive info - all secrets are encrypted
    isSecret: true,
    // Defines the access scope
    // app-scope ensures only developers can create/replace secrets via CLI
    scope: 'app',
  },
]);

async function getUserInfo(username: string, context: Devvit.Context){
  try {
    const user= await context.reddit.getUserByUsername(username);
    if (user){
      context.ui.showToast(`Found User: '${user.username}'`);
      console.log(`Found User: '${user.username}'`);
    }
    else{
      context.ui.showToast(`Cannot Find User: '${username}'`);
      console.log(`Cannot Find User: '${username}'`);
    } 
  } 
  catch(error){
    context.ui.showToast(`Error with User: '${username}' '${error}'`);
    console.log(`Error with User: '${username}' '${error}'`);
  }
}

const trackingForm = Devvit.createForm(
  {
    fields: [{ name: 'user', label: 'Enter a User: (Do not include u/', type: 'string' }],
    title: 'My Form',
    acceptLabel: 'Submit',
  },
  (event, context) => {
    // Handle form submission here
    const userInput = event.values.user as string;
    getUserInfo(userInput, context);
  }
);

Devvit.addMenuItem({
  location: 'subreddit',
  label: 'Track a User',
  forUserType:'moderator',
  onPress: (event, context) => {
    console.log(`Pressed ${event.targetId}`);
    context.ui.showForm(trackingForm);
  },
});

export default Devvit;
