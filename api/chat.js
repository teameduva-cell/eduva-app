module.exports = async function handler(req, res) {
  const result = {
    candidates: [
      {
        content: {
          parts: [
            {
              text: "EDUVA API working hai bhai ✅"
            }
          ]
        }
      }
    ]
  };

  return res.status(200).json(result);
};