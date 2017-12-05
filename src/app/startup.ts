export default (GG) => {
  GG.DB.Redis.flushall();
  console.log(`API Server is now running on http://localhost:${8000}`);
}