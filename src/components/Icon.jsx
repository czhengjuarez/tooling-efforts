/**
 * Icon component - Renders SVG icons from the icons sprite sheet
 * Usage: <Icon name="lightbulb" className="w-4 h-4" />
 */

const Icon = ({ name, className = "w-5 h-5", ...props }) => {
  const icons = {
    // Impact icon (from impact.svg)
    lightbulb: (
      <svg className={className} viewBox="0 0 13 13" fill="currentColor" {...props}>
        <g clipPath="url(#clip0_4977_2331)">
          <path d="M8.12947 12.1918H4.87155V12.9892H8.12947V12.1918Z" fill="currentColor"/>
          <path d="M6.88127 0H6.0838V1.72189H6.88127V0Z" fill="currentColor"/>
          <path d="M10.5309 1.64643L9.31347 2.86384L9.87722 3.4276L11.0946 2.21018L10.5309 1.64643Z" fill="currentColor"/>
          <path d="M12.6167 5.8498H10.895V6.64727H12.6167V5.8498Z" fill="currentColor"/>
          <path d="M2.10499 5.88473H0.383301V6.6822H2.10499V5.88473Z" fill="currentColor"/>
          <path d="M2.44439 1.67121L1.88062 2.23494L3.09813 3.45255L3.66191 2.88881L2.44439 1.67121Z" fill="currentColor"/>
          <path d="M6.5 2.48219C5.68009 2.48201 4.8823 2.74819 4.22674 3.24064C3.57118 3.73309 3.09332 4.42516 2.86511 5.21268C2.63689 6.0002 2.67067 6.84054 2.96136 7.6072C3.25205 8.37386 3.78391 9.02535 4.47688 9.46359V10.9647L4.875 11.3648H8.125L8.52313 10.9647V9.46359C9.2161 9.02535 9.74796 8.37386 10.0386 7.6072C10.3293 6.84054 10.3631 6.0002 10.1349 5.21268C9.90669 4.42516 9.42883 3.73309 8.77327 3.24064C8.11771 2.74819 7.31992 2.48201 6.5 2.48219ZM7.93407 8.88672L7.72688 9.00047V10.5666H5.27313V9.00047L5.06594 8.88672C4.48373 8.56821 4.02413 8.06493 3.75962 7.45628C3.49512 6.84763 3.44077 6.16825 3.60514 5.52529C3.76952 4.88233 4.14327 4.31238 4.66744 3.90537C5.19161 3.49834 5.83636 3.27741 6.5 3.27741C7.16364 3.27741 7.8084 3.49834 8.33257 3.90537C8.85674 4.31238 9.23049 4.88233 9.39487 5.52529C9.55924 6.16825 9.50489 6.84763 9.24039 7.45628C8.97588 8.06493 8.51628 8.56821 7.93407 8.88672Z" fill="currentColor"/>
        </g>
        <defs>
          <clipPath id="clip0_4977_2331">
            <rect width="13" height="13" fill="white"/>
          </clipPath>
        </defs>
      </svg>
    ),
    
    // Effort icon (from Effort.svg)
    lightning: (
      <svg className={className} viewBox="0 0 9 9" fill="currentColor" {...props}>
        <path d="M6.90371 3.59984H5.0109L5.60152 0.258594L5.08965 0.0546875L1.8623 4.92172L2.09715 5.35766H4.03777L3.50762 8.73266L4.0223 8.92672L7.14137 4.03156L6.90371 3.59984Z" fill="currentColor"/>
      </svg>
    ),
    
    // Sparkles/Generate icon
    sparkles: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2l2.4 7.4L22 12l-7.6 2.6L12 22l-2.4-7.4L2 12l7.6-2.6L12 2z"/>
        <path d="M5 3l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" opacity="0.5"/>
      </svg>
    ),
    
    // Trash/Delete icon (from button.svg)
    trash: (
      <svg className={className} viewBox="0 0 20 20" fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d="M6.875 3.34375L7.5 2.71875H12.5L13.125 3.34375V5.21875H16.25L16.875 5.84375V8.03125L16.25 8.65625H15.8868L15 18.6562L14.375 19.2812H5.625L5 18.6562L4.1132 8.65625H3.75L3.125 8.03125V5.84375L3.75 5.21875H6.875V3.34375ZM8.125 3.96875V5.21875H11.875V3.96875H8.125ZM4.375 7.40625V6.46875H15.625V7.40625H4.375ZM5.3125 8.65625L6.25 18.0312H13.75L14.6875 8.65625H5.3125ZM6.8774 10.2204V15.5312H8.1274V10.2204H6.8774ZM11.8732 15.5312V10.2204H13.1232V15.5312H11.8732ZM9.3756 10.2204V15.5312H10.6256V10.2204H9.3756Z"/>
      </svg>
    ),
    
    // Broom/Clean icon
    broom: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M19.36 2.72l1.92 1.92-5.78 5.78-1.92-1.92 5.78-5.78zM5.93 17.57c-2.01-2.01-3.24-4.41-3.58-6.65l4.88-2.09 7.44 7.44-2.09 4.88c-2.24-.34-4.64-1.57-6.65-3.58z"/>
      </svg>
    ),
    
    // Sticky note icon (from sticky.svg)
    book: (
      <svg className={className} viewBox="0 0 16 13" fill="currentColor" {...props}>
        <path d="M13 1.625H11.5V1.21875L11 0.8125H5L4.5 1.21875V1.625H3L2.5 2.03125V11.375L3 11.7812H13L13.5 11.375V2.03125L13 1.625ZM5.5 1.625H10.5V2.4375H5.5V1.625ZM12.5 10.9688H3.5V2.4375H4.5V2.84375L5 3.25H11L11.5 2.84375V2.4375H12.5V10.9688Z" fill="currentColor"/>
        <path d="M7.97775 4.20205H4.64325V5.01455H7.97775V4.20205Z" fill="currentColor"/>
        <path d="M11.3567 5.89997H4.64325V6.71247H11.3567V5.89997Z" fill="currentColor"/>
        <path d="M11.3567 7.59789H4.64325V8.41039H11.3567V7.59789Z" fill="currentColor"/>
      </svg>
    ),
    
    // AI icon (from AI.svg)
    robot: (
      <svg className={className} viewBox="0 0 27 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" clipRule="evenodd" d="M15.9492 5.82812V0.15625H18.0117V5.82812H15.9492ZM3.31641 2.47656V0.929688H5.37891V2.47656H6.92578V4.53906H5.37891V6.08594H3.31641V4.53906L1.76953 4.53906L1.76953 2.47656L3.31641 2.47656ZM13.5168 7.69L11.5114 5.68469L12.9698 4.22628L14.9752 6.23159L13.5168 7.69ZM18.9858 6.23159L20.9911 4.22628L22.4495 5.68469L20.4442 7.69L18.9858 6.23159ZM7.44141 8.66406H13.1133V10.7266H7.44141V8.66406ZM20.8477 8.66406H26.5195V10.7266H20.8477V8.66406ZM20.9911 15.1643L18.9858 13.159L20.4442 11.7006L22.4495 13.7059L20.9911 15.1643ZM11.5114 13.7059L13.5168 11.7006L14.9752 13.159L12.9698 15.1643L11.5114 13.7059ZM15.9492 19.2344V13.5625H18.0117V19.2344H15.9492ZM3.31641 18.332V15.625H5.37891V18.332H8.08594V20.3945H5.37891V23.1016H3.31641V20.3945H0.609375V18.332H3.31641Z" fill="currentColor"/>
      </svg>
    ),
    
    // Check/Success icon
    check: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>
    ),
    
    // Info/Tip icon
    info: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>
    ),
    
    // Number/Hash icon
    number: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M20 10V8h-4V4h-2v4h-4V4H8v4H4v2h4v4H4v2h4v4h2v-4h4v4h2v-4h4v-2h-4v-4h4zm-6 4h-4v-4h4v4z"/>
      </svg>
    ),
    
    // Search icon
    search: (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
      </svg>
    ),
  };

  return icons[name] || null;
};

export default Icon;
