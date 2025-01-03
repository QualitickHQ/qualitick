'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { redirect, usePathname } from 'next/navigation'
import { PiGear, PiPlus, PiChartDonut } from 'react-icons/pi'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ProjectProvider, useProject } from './ProjectContext'
import { AddProjectDialog } from './addProjectDialog'
import { checkAuth } from './actions'


function ConsoleLayoutContent({ children }: { children: React.ReactNode }) {
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false)
  const { projects, currentProject, setCurrentProject } = useProject()
  const pathname = usePathname()

  const routes = [
    { name: 'Dashboard', href: '/console/dashboard', icon: PiChartDonut },
    { name: 'Settings', href: '/console/settings', icon: PiGear },
  ]

  useEffect(() => {
    handleCheckAuth()
  }, [])

  const handleCheckAuth = async () => {
    const auth = await checkAuth()
    if (!auth) {
      redirect('/auth/login')
    }
  }


  return (
    <div className="flex h-screen">
      <div className="w-[250px] border-r-[1px] border-gray-200 p-4">
        <div className="flex justify-between h-full flex-col">
          <div>
            <div className="mb-4">
              {projects.length > 0 ? (
                <Select value={currentProject} onValueChange={setCurrentProject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-gray-500">No projects available</div>
              )}
            </div>
            <Button className="w-full mb-4 flex items-center justify-center gap-2" onClick={() => setIsAddProjectOpen(true)}>
              <PiPlus /> Add Project
            </Button>

            <nav>
              <ul>
                {routes.map((route) => (
                  <li key={route.href} className="mb-2">
                    <Link
                      href={route.href}
                      className={`flex items-center p-2 rounded ${pathname === route.href ? 'bg-gray-200' : 'hover:bg-gray-200'
                        }`}
                    >
                      <route.icon className="mr-2" />
                      {route.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
      <div className="p-5 h-screen overflow-auto" style={{ width: 'calc(100vw - 250px)' }}>{children}</div>
      <AddProjectDialog isOpen={isAddProjectOpen} onClose={() => setIsAddProjectOpen(false)} />
    </div>
  )
}

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {

  return (
    <ProjectProvider>
      <ConsoleLayoutContent>{children}</ConsoleLayoutContent>
    </ProjectProvider>
  )
}