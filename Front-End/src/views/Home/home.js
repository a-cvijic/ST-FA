import React, { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    // Request notification permission and send notification if granted
    Notification.requestPermission().then(status => {
      if (status === 'granted') {
        sendNotification("Dobrodošli na domači strani");
      }
    });
  }, []);

  // Function to send notification
  function sendNotification(title, message) {
    const options = {
      body: message
    };
    new Notification(title, options);
  }

  return <h1>Welcome to the Home Page</h1>;
};

export default Home;
