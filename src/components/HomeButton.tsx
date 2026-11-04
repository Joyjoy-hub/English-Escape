import { Link } from 'react-router'

import './HomeButton.css'

type HomeButtonProps = {
  className?: string
}

export function HomeButton({ className }: HomeButtonProps) {
  const classes = className ? `home-button ${className}` : 'home-button'
  return (
    <Link className={classes} to="/home">
      홈
    </Link>
  )
}
