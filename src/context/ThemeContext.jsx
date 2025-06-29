import React, {createContext, useState, useEffect} from 'react'
import './ThemeContext.css'
import lightBackground from '../assets/bg-light.png'
import darkBackground from '../assets/bg-dark.png'
export const ThemeContext = createContext()

export const ThemeProvider = ({children}) => {
    const [theme, setTheme] = useState('light')

    useEffect(() => {
        const savedTheme = localStorage.getItem('weatherAppTheme')
        if (savedTheme) {
            setTheme(savedTheme)
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setTheme('dark')
        }
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('weatherAppTheme', newTheme)
    }

    return (
        <ThemeContext.Provider value={{theme, toggleTheme}}>
            <div className={`app-container ${theme}-theme`}
                style={{
                    backgroundImage: `url(${theme === 'light' ? lightBackground : darkBackground})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {children}
            </div>
        </ThemeContext.Provider>
    )
}