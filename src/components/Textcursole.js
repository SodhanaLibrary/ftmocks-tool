import * as React from 'react';

export default function Textcursole() {
  return (
    <div className="carousel">
      <div className="slides">
        <div className="slide" id="slide1">
          <h2>FT mock</h2>
          <p>Your journey starts here. Discover our services and offerings.</p>
        </div>
        <div className="slide" id="slide2">
          <h2>products</h2>
          <p>
            We are committed to providing top-notch services tailored to your
            needs.
          </p>
        </div>
        <div className="slide" id="slide3">
          <h2>Docs</h2>
          <p>Explore a variety of services designed to help you succeed.</p>
        </div>
        <div className="slide" id="slide4">
          <h2>Team</h2>
          <p>If you need assistance, reach out to our support team.</p>
        </div>
        <div className="slide" id="slide5">
          <h2>Pricing</h2>
          <p>If you need assistance, reach out to our pricing.</p>
        </div>
      </div>
    </div>
  );
}
