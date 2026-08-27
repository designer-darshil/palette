import React, { useEffect } from 'react';
import { applySEO, SEOHeadProps } from '../../utils/seoHead';

export const SEOHead: React.FC<SEOHeadProps> = (props) => {
  useEffect(() => {
    applySEO(props);
  }, [
    props.title,
    props.rawTitle,
    props.description,
    props.canonicalPath,
    props.noindex,
    props.nofollow,
    props.ogType,
    props.ogImage,
    props.jsonLd,
    props.keywords,
  ]);

  return null;
};
