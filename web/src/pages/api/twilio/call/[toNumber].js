import makeCall from "../../../../lib/twilio";

const handler = async (req, res) => {
  const { toNumber } = req.query;
  makeCall(toNumber);
  res.status(200).json({ status: "ok", toNumber: toNumber });
};

export default handler;
