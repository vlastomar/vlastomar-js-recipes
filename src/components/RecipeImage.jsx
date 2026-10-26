import React, { useEffect, useState } from 'react';

export default function RecipeImage({ url, title }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [url]);

  if (!url || failed) {
    return (
      <div
        className="recipe-image recipe-image-placeholder"
        aria-label="Няма снимка"
      >
        🍲
      </div>
    );
  }

  return (
    <img
      className="recipe-image"
      src={url}
      alt={title}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}