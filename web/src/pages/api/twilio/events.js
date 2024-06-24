const handler = async (req, res) => {
  console.log(req.body);
  res.status(200).json({ status: "ok", body: req.body });
};

export default handler;
