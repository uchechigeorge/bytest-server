import app from "./app";

const start = (port?: number) => {
  const PORT = port || process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
  });
};

start();
