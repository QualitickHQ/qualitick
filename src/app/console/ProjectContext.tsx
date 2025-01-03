'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'
import { fetchProjects } from './actions'

interface Project {
    id: string
    name: string
}

interface ProjectContextType {
    projects: Project[]
    currentProject: string
    setCurrentProject: (id: string) => void
    refreshProjects: () => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
    const [projects, setProjects] = useState<Project[]>([])
    const [currentProject, setCurrentProject] = useState("")

    const refreshProjects = async () => {
        const fetchedProjects = await fetchProjects()
        setProjects(fetchedProjects)
        if (fetchedProjects.length > 0 && currentProject === "") {
            setCurrentProject(fetchedProjects[0].id)
        }
    }

    useEffect(() => {
        refreshProjects()
    }, [])

    return (
        <ProjectContext.Provider value={{ projects, currentProject, setCurrentProject, refreshProjects }}>
            {children}
        </ProjectContext.Provider>
    )
}

export function useProject() {
    const context = useContext(ProjectContext)
    if (context === undefined) {
        throw new Error('useProject must be used within a ProjectProvider')
    }
    return context
}
