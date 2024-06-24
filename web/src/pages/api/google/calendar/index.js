import { google } from "googleapis";

export default async function handler(req, res) {
  try {
    // Extract the access token from the request headers or query parameters
    //const accessToken = req.headers.authorization.split("Bearer ")[1];

    // Set up the OAuth client with the access token
    const auth = new google.auth.OAuth2();
    auth.setCredentials({
      access_token: "ya29...",
      token_type: "Bearer",
      expires_in: 3599,
      scope:
        "email profile https://www.googleapis.com/auth/calendar.calendars https://www.googleapis.com/auth/gmail.settings.basic https://www.googleapis.com/auth/calendar.acls https://www.googleapis.com/auth/calendar.calendarlist https://www.googleapis.com/auth/gmail.modify https://www.googleapis.com/auth/calendar.calendarlist.readonly https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/gmail.insert https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.freebusy https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.labels https://www.googleapis.com/auth/calendar.app.created https://www.googleapis.com/auth/calendar https://mail.google.com/ https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.freebusy https://www.googleapis.com/auth/calendar.events.owned openid",
      authuser: "0",
      hd: "tomredman.ca",
      prompt: "consent",
    });

    //const calendar = google.calendar({ version: "v3", auth });
    const gmail = google.gmail({ version: "v1", auth });
    try {
      // List the user's messages
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 10, // Specify the number of messages to retrieve
      });

      // Get the messages
      const messages = response.data.messages;

      //console.log(messages);

      // Retrieve and store content for each message
      const result = await Promise.all(
        messages.map(async (message) => {
          const messageDetails = await gmail.users.messages.get({
            userId: "me",
            id: message.id,
          });

          const subjectHeader = messageDetails.data.payload.headers.find(
            (header) => header.name === "Subject"
          );
          const subject = subjectHeader ? subjectHeader.value : "No Subject";
          const body = messageDetails.data.snippet;

          return {
            subject,
            body,
          };
        })
      );

      console.log("OK....");
      console.log(result);

      // Send the result as JSON
      return res.json(result);
    } catch (error) {
      console.error("Error listing emails:", error);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Create a Calendar API client
    const calendar = google.calendar({ version: "v3", auth });

    // Retrieve the list of calendars
    const response = await calendar.calendarList.list();

    // Send the list of calendars in the response
    res.status(200).json(response.data.items);
  } catch (error) {
    console.error("Error fetching calendars:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
