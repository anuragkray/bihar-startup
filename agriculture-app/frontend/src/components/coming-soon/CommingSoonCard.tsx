import React from 'react';
import style from './CommingSoonCard.module.scss'; 

const ComingSoonCard= () => {
  return (
    <div className={style.card}>
      <h2>Coming Soon</h2>
      <p>We will soon be available in your location.</p>
      <p>Our team is actively working with the Bihar government to provide these facilities soon.</p>
    </div>
  );
};

export default ComingSoonCard;
