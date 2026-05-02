import React from 'react';

type Props = {
    title: string;
};

const style: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    fontWeight: 600,
    fontSize: 16,
    padding: '0 16px',
};

// Rendered into the `headerCentreComponent` slot of registerProduct — the area
// where Channels shows the channel name. For a generic embed there is nothing
// dynamic to put here; we just label the product so the header is not empty.
const ProductHeaderTitle: React.FC<Props> = ({title}) => (
    <div style={style}>{title}</div>
);

export default ProductHeaderTitle;
