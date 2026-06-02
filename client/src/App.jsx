import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [originalUrl, setOriginalUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [shortUrl, setShortUrl] = useState("");

  const API = "http://localhost:5000";

  // Fetch URLs
  const getUrls = async () => {
    try {
      const res = await axios.get(`${API}/api/urls`);
      setUrls(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUrls();
  }, []);

  // Create URL
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!originalUrl) {
      return alert("Please Enter URL");
    }

    try {
      const res = await axios.post(`${API}/api/shorten`, {
        originalUrl,
      });

      setShortUrl(res.data.shortUrl);
      setOriginalUrl("");
      getUrls();
    } catch (error) {
      console.log(error);
    }
  };

  // Delete URL
  const deleteUrl = async (id) => {
    try {
      await axios.delete(`${API}/api/url/${id}`);
      getUrls();
    } catch (error) {
      console.log(error);
    }
  };

  // Copy URL
  const copyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert("Copied");
  };

  return (
    <div className="container">

      <h1>🔗 URL Shortener</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Long URL"
          value={originalUrl}
          onChange={(e) =>
            setOriginalUrl(e.target.value)
          }
        />

        <button type="submit">
          Shorten URL
        </button>
      </form>

      {shortUrl && (
        <div className="result">
          <h3>Generated URL</h3>

          <a
            href={shortUrl}
            target="_blank"
            rel="noreferrer"
          >
            {shortUrl}
          </a>

          <button
            onClick={() => copyLink(shortUrl)}
          >
            Copy
          </button>
        </div>
      )}

      <h2>All URLs</h2>

      <table>
        <thead>
          <tr>
            <th>Original URL</th>
            <th>Short URL</th>
            <th>Clicks</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {urls.map((url) => (
            <tr key={url._id}>
              <td>{url.originalUrl}</td>

              <td>
                <a
                  href={`${API}/${url.shortCode}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {url.shortCode}
                </a>
              </td>

              <td>{url.clicks}</td>

              <td>
                <button
                  onClick={() =>
                    deleteUrl(url._id)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}

export default App;