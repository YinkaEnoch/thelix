/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as SignupImport } from './routes/signup'
import { Route as LoginImport } from './routes/login'
import { Route as IndexImport } from './routes/index'
import { Route as DashboardIndexImport } from './routes/dashboard/index'
import { Route as DashboardTeamImport } from './routes/dashboard/team'
import { Route as DashboardTaskImport } from './routes/dashboard/task'

// Create/Update Routes

const SignupRoute = SignupImport.update({
  id: '/signup',
  path: '/signup',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const DashboardIndexRoute = DashboardIndexImport.update({
  id: '/dashboard/',
  path: '/dashboard/',
  getParentRoute: () => rootRoute,
} as any)

const DashboardTeamRoute = DashboardTeamImport.update({
  id: '/dashboard/team',
  path: '/dashboard/team',
  getParentRoute: () => rootRoute,
} as any)

const DashboardTaskRoute = DashboardTaskImport.update({
  id: '/dashboard/task',
  path: '/dashboard/task',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/signup': {
      id: '/signup'
      path: '/signup'
      fullPath: '/signup'
      preLoaderRoute: typeof SignupImport
      parentRoute: typeof rootRoute
    }
    '/dashboard/task': {
      id: '/dashboard/task'
      path: '/dashboard/task'
      fullPath: '/dashboard/task'
      preLoaderRoute: typeof DashboardTaskImport
      parentRoute: typeof rootRoute
    }
    '/dashboard/team': {
      id: '/dashboard/team'
      path: '/dashboard/team'
      fullPath: '/dashboard/team'
      preLoaderRoute: typeof DashboardTeamImport
      parentRoute: typeof rootRoute
    }
    '/dashboard/': {
      id: '/dashboard/'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof DashboardIndexImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/signup': typeof SignupRoute
  '/dashboard/task': typeof DashboardTaskRoute
  '/dashboard/team': typeof DashboardTeamRoute
  '/dashboard': typeof DashboardIndexRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/signup': typeof SignupRoute
  '/dashboard/task': typeof DashboardTaskRoute
  '/dashboard/team': typeof DashboardTeamRoute
  '/dashboard': typeof DashboardIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/login': typeof LoginRoute
  '/signup': typeof SignupRoute
  '/dashboard/task': typeof DashboardTaskRoute
  '/dashboard/team': typeof DashboardTeamRoute
  '/dashboard/': typeof DashboardIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/login'
    | '/signup'
    | '/dashboard/task'
    | '/dashboard/team'
    | '/dashboard'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/login'
    | '/signup'
    | '/dashboard/task'
    | '/dashboard/team'
    | '/dashboard'
  id:
    | '__root__'
    | '/'
    | '/login'
    | '/signup'
    | '/dashboard/task'
    | '/dashboard/team'
    | '/dashboard/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  LoginRoute: typeof LoginRoute
  SignupRoute: typeof SignupRoute
  DashboardTaskRoute: typeof DashboardTaskRoute
  DashboardTeamRoute: typeof DashboardTeamRoute
  DashboardIndexRoute: typeof DashboardIndexRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  LoginRoute: LoginRoute,
  SignupRoute: SignupRoute,
  DashboardTaskRoute: DashboardTaskRoute,
  DashboardTeamRoute: DashboardTeamRoute,
  DashboardIndexRoute: DashboardIndexRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/login",
        "/signup",
        "/dashboard/task",
        "/dashboard/team",
        "/dashboard/"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/signup": {
      "filePath": "signup.tsx"
    },
    "/dashboard/task": {
      "filePath": "dashboard/task.tsx"
    },
    "/dashboard/team": {
      "filePath": "dashboard/team.tsx"
    },
    "/dashboard/": {
      "filePath": "dashboard/index.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
