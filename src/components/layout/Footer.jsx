import React from 'react';
import { siteContent } from '../../data/siteContent';

const Footer = () => (
  <footer className="site-footer" aria-label="Footer">
    <p>
      (c) {new Date().getFullYear()} {siteContent.identity.name}. Built with React.
    </p>
  </footer>
);

export default Footer;
