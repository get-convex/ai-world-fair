import { Twilio } from 'twilio';

const accountSid: string | undefined = process.env.TWILIO_ACCOUNT_SID;
const authToken: string | undefined = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Twilio Account SID and Auth Token must be set in environment variables');
}

const client = new Twilio(accountSid, authToken);

const makeCall = async (toNumber: string, requestId: string): Promise<void> => {
  const call = await client.calls.create({
    record: true,
    statusCallback: 'https://really-first-goat.ngrok-free.app/twiml',
    statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
    statusCallbackMethod: 'POST',
    to: `+${toNumber}`,
    from: '+16476958664',
    twiml: `<Response>
         <Connect>
             <Stream url="wss://really-first-goat.ngrok-free.app/${requestId}" />
         </Connect>
      </Response>`,
  });

  console.log('MADE A CALL: ', call.sid);

  //TODO Return this call SID
};

export default makeCall;
