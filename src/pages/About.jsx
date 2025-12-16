import React from 'react';
import { Link } from 'react-router-dom';
import "../styles/About.css";

function About() {
  return (
    <div className="about-container animate-page">
      <section className="home-pg">
        <div className="home-content1">
          <h2>Hello, I'm</h2>
          <h1 className="animation1"><span></span></h1>
          <h3>
            I'm passionate about building mechanical keyboards. Building keyboards is a creative outlet where I get to experiment with different switches and keycaps to design something unique and tailored to my preferences. It's like building legos, but with the added satisfaction of creating a functional tool I use everyday.
            <br /><br />
            When I'm not building keyboards, you can find me rock climbing-especially bouldering. I enjoy the challenge of solving the climbing problem and the grit required to finish a climb. I also enjoy videography. I love capturing moments through a lens. Each of these hobbies bring a unique form of creativity to my life.
          </h3>
        </div>
        {/* <div className="ppf-img1">
          <img src="/images/ppf.jpg" alt="" />
        </div> */}
      </section>
    </div>
  );
}

export default About;
  