import { createBrowserRouter } from 'react-router';
import { RootLayout } from './components/RootLayout';
import { AttendanceView } from './components/AttendanceView';
import { ManageTeam } from './components/ManageTeam';
import { HistoryView } from './components/HistoryView';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: AttendanceView },
      { path: 'manage', Component: ManageTeam },
      { path: 'history', Component: HistoryView },
    ],
  },
]);
