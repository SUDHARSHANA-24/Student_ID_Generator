import React from 'react';

const Logo = ({ className = "h-12 w-auto" }) => {
    return (
        <svg
            viewBox="0 0 350 120"
            className={className}
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Cards Group - Isometric Projection */}
            <g transform="translate(5, 5)">
                {/* -- Blue Card (Back) -- */}
                <g transform="translate(10, 15)">
                    {/* Left Edge (Thickness) */}
                    <path d="M0,25 v55 l12,-8 v-55 z" fill="#4B77A8" />
                    {/* Top Edge (Thickness) */}
                    <path d="M0,25 l75,-25 l12,8 l-75,25 z" fill="#6C9CD2" />
                    {/* Main Face */}
                    <g transform="matrix(0.9, -0.3, 0, 1, 12, 17)">
                        <rect x="0" y="0" width="85" height="55" rx="3" fill="#2B548B" />
                        <rect x="0" y="8" width="85" height="12" fill="#1A3A68" />
                    </g>
                </g>

                {/* -- Red Card (Front) -- */}
                <g transform="translate(45, 30)">
                    {/* Left Edge (Thickness) */}
                    <path d="M0,25 v55 l12,-8 v-55 z" fill="#7A132B" />
                    {/* Top Edge (Thickness) */}
                    <path d="M0,25 l75,-25 l12,8 l-75,25 z" fill="#C9324E" />
                    
                    {/* Main Face */}
                    <g transform="matrix(0.9, -0.3, 0, 1, 12, 17)">
                        {/* Base Red Card */}
                        <rect x="0" y="0" width="85" height="55" rx="3" fill="#9D1D3A" />
                        
                        {/* White inner shape */}
                        <rect x="5" y="5" width="75" height="45" rx="2" fill="#FCE8EC" />
                        
                        {/* Picture placeholder */}
                        <rect x="10" y="12" width="20" height="25" fill="#9D1D3A" rx="1" />
                        
                        {/* Person Silhouette */}
                        <circle cx="20" cy="20" r="4.5" fill="#FCE8EC" />
                        <path d="M12,34 c0,-6 3,-9 8,-9 s8,3 8,9 z" fill="#FCE8EC" />
                        
                        {/* Text lines */}
                        <rect x="35" y="14" width="25" height="6" fill="#9D1D3A" />
                        <rect x="35" y="26" width="40" height="6" fill="#9D1D3A" />
                        <rect x="10" y="42" width="65" height="4" fill="#9D1D3A" />
                    </g>
                </g>
            </g>

            {/* Text "EDU ID" */}
            <text 
                x="150" 
                y="55" 
                fill="#9D1D3A" 
                fontFamily="Impact, 'Arial Black', sans-serif" 
                fontSize="48" 
                fontWeight="bold" 
                letterSpacing="4"
                style={{ textTransform: 'uppercase' }}
            >
                EDU ID
            </text>

            {/* Text "SYSTEMS" */}
            <text 
                x="155" 
                y="95" 
                fill="#1A3A68" 
                fontFamily="Arial, sans-serif" 
                fontSize="24" 
                fontWeight="900" 
                letterSpacing="8"
            >
                SYSTEMS
            </text>
        </svg>
    );
};

export default Logo;
