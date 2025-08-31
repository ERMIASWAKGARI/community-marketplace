import sightengine from "sightengine";

const modClient = sightengine(
  process.env.SIGHTENGINE_API_USER,
  process.env.SIGHTENGINE_API_SECRET
);

export default modClient;
