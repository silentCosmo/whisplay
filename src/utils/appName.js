import { Eagle_Lake, Henny_Penny } from 'next/font/google';
import React from 'react'

const eagle = Eagle_Lake({
  weight: '400',
  subsets: ["latin"],
});
const test = Henny_Penny({
  weight: '400',
  subsets: ["latin"],
});

function Whisplay({className}) {
    console.log(className);
    
  return (
    <span className={`${test.className} ${className || ''}`}>Whisplay</span>
  )
}

export default Whisplay