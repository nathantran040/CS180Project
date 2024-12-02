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

//Gets the information from Reddit 
const ResultForm = Devvit.createForm({
  fields: [
    {name: 'userna', type: 'string', label: 'Username'},
    {name: 'id', type: 'string', label: 'User Id'},
    {name: 'DayofCreation', type: 'string', label: 'DoC'},
    {name: 'linkKarma', type: 'string', label: 'lK'},
    {name: 'commentKarma', type: 'string', label: 'cK'},
    {name: 'recentHistory', type: 'string', label: 'rH'},
  ],
  title: 'Results',
  acceptLabel: 'Close',
  cancelLabel: '',
},
(event, context) =>{
  console.log('Form closed');
}
);

//Condenses the information of a given user
async function getUserInfo(username: string, context: Devvit.Context){
  try {
    const user= await context.reddit.getUserByUsername(username);
    if (user){
      const recentHist =await context.reddit.getCommentsAndPostsByUser({username: user.username, limit:10});
      let histString = '';
      //extracts the most recent posts and comments from the user (Text only since we're not doing image analysis)
      for await (const item of recentHist){
        if('body' in item){
          histString += `Comment: ${item.body.substring(0,100) || '[No content]'}...\n`;
        }
        else if('title' in item){
          histString+=`Post: ${item.title} - ${item.createdAt.toLocaleString()}\n`;
        }
      }
      //Turns the user information parts that are not strings into strings so we can print them
      context.ui.showForm(ResultForm,{
        userna: user.username,
        id: user.id,
        DayofCreation: new Date(user.createdAt).toLocaleString(),
        linkKarma: user.linkKarma.toString(),
        commentKarma: user.commentKarma.toString(),
        recentHistory: histString,
      });
      //prints the user information into th econsole 
      console.log(`Found User: '${user.username}',\n Link Karma:'${user.linkKarma.toString()}', \n User ID: '${user.id}',\n Account Birthday: '${new Date(user.createdAt).toLocaleString()}'\n Comment Karma: '${user.commentKarma.toString()}',\n10 most recent posts:\n'${histString}'`);
      if(histString.includes("Kyle Hill")){
        console.log('\n*******************\n The user likes Kyle Hill');
      }
      else{
        console.log("The includes function is not working as expected");
      }

    }
    //Checks if the user was found 
    else{
      context.ui.showToast(`Cannot Find User: '${username}'`);
      console.log(`Cannot Find User: '${username}'`);
    } 
  } 
  //Cathes other errors
  catch(error){
    context.ui.showToast(`Error with User: '${username}' '${error}'`);
    console.log(`Error with User: '${username}' '${error}'`);
  }
}

//This is the reddit application part
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

//This adds the app to the reddit menu
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
