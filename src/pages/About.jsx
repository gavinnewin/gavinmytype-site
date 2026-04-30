import { useRef, useState } from 'react';
import "../styles/About.css";

const videos = [
  "/videos/ssstik.io_@gavinmytype_1767958642436.mp4",
  "/videos/Timeline 1.mov",
  "/videos/kendama.mp4",
  "/videos/ssstik.io_@gavinrocksmyworld_1777331230821.mp4",
];

function About() {
  const videoRefs = useRef([]);
  const [playing, setPlaying] = useState({});

  const handleTouchStart = (i) => {
    const video = videoRefs.current[i];
    if (!video) return;
    if (video.paused) {
      video.play();
      setPlaying((p) => ({ ...p, [i]: true }));
    } else {
      video.pause();
      video.currentTime = 0;
      setPlaying((p) => ({ ...p, [i]: false }));
    }
  };

  return (
    <div className="about-container animate-page">
      <section className="about-bio">
        <p className="about-hello">Hello, I'm</p>
        <h1 className="animation1"><span></span></h1>
        <p>
          I'm passionate about building mechanical keyboards. It's a creative outlet where I get to experiment with different switches and keycaps to design something unique and tailored to my preferences. It's like building legos, but with the added satisfaction of creating a functional tool I use every day.
        </p>
        <p>
          When I'm not building keyboards, you can find me rock climbing, playing kendama, or behind a camera. Rock climbing keeps me physically fit and I love the problem-solving and grit it takes to finish a route. Kendama is a Japanese skill toy that looks simple but has an incredibly deep skill ceiling; it's a good reminder that mastery takes repetition. Videography ties it all together. I love capturing moments through a lens.
        </p>
      </section>

      <section className="about-videos">
        <p className="about-videos-label">a look into my world</p>
        <div className="about-videos-grid">
          {videos.map((src, i) => (
            <div
              key={i}
              className={`about-video-wrap${playing[i] ? " playing" : ""}`}
              onTouchStart={() => handleTouchStart(i)}
            >
              <video
                ref={(el) => (videoRefs.current[i] = el)}
                className="about-video"
                src={src}
                playsInline
                loop
                onMouseEnter={(e) => { e.target.play(); setPlaying((p) => ({ ...p, [i]: true })); }}
                onMouseLeave={(e) => { e.target.pause(); e.target.currentTime = 0; setPlaying((p) => ({ ...p, [i]: false })); }}
              />
              <div className="about-video-hint">&#9654;</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;
