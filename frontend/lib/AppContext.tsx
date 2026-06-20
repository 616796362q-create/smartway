'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export type Lang = 'en' | 'so'

export const T = {
  en: {
    // Nav
    dashboard: 'Dashboard', staff: 'Staff Register', payroll: 'Payroll',
    expenses: 'Expenses', dogs: 'Dogs Management', vehicles: 'Vehicles',
    finance: 'Finance', reports: 'Reports', users: 'User Accounts',
    logout: 'Sign Out',
    // Common
    save: 'Save', cancel: 'Cancel', edit: 'Edit', delete: 'Delete',
    add: 'Add', search: 'Search', loading: 'Loading...', saving: 'Saving...',
    confirm: 'Confirm', yes: 'Yes, Delete', no: 'Cancel',
    areYouSure: 'Are you sure?', deleting: 'Deleting...',
    noRecords: 'No records found', register: 'Register',
    update: 'Update', actions: 'Actions', status: 'Status',
    date: 'Date', note: 'Note', amount: 'Amount ($)', total: 'Total',
    close: 'Close', back: 'Back', all: 'All', today: 'Today',
    returnToToday: 'Return to Today',
    automatic: 'Automatic',
    connectionError: 'Could not connect to server!',
    // Staff page
    staffReg: 'Staff Register', staffCount: 'staff registered',
    addStaff: 'Register Staff', editStaff: 'Edit Staff',
    name: 'Full Name', phone: 'Phone', position: 'Position',
    salary: 'Salary ($)', startDate: 'Join Date', active: 'Active',
    inactive: 'Inactive', staffId: 'Staff ID',
    deleteStaffTitle: 'Confirm Delete',
    deleteStaffMsg: 'You are about to delete:',
    deleteStaffWarn: '⚠️ This action cannot be undone!',
    stopDelete: 'Cancel',
    confirmDelete: 'Yes, Delete',
    searchPlaceholder: 'Search name, ID, position...',
    // Expenses
    expensesTitle: 'Expenses — Company Costs',
    expensesSubtitle: 'Record all daily company expenses',
    addExpense: 'Add Expense',
    selectDate: 'Select Date (Filter):',
    kitchenExpTotal: 'Kitchen Expense for Selected Date',
    noKitchenExp: 'No kitchen expenses recorded for this date',
    noExpenses: 'No expenses recorded for this date',
    kitchenModalTitle: 'Add Kitchen Expense',
    kitchenAmountLabel: 'Kitchen Amount Today ($)',
    kitchenAmountHint: 'Enter total kitchen cost for today — one number only',
    noteOptional: 'Note (Optional)',
    expenseSubcat: 'Sub-Category',
    expenseDesc: 'Description',
    addExpenseFor: 'Add Expense for',
    editExpense: 'Edit Expense',
    deleteExpenseTitle: 'Confirm Delete',
    deleteExpenseMsg: 'Are you sure you want to delete this expense?',
    kitchenJiko: 'Kitchen (Jiko)',
    fuelShidaal: 'Fuel (Shidaal)',
    repairsDayactir: 'Repairs (Dayactir)',
    utilities: 'Utilities',
    others: 'Others',
    // Dogs
    dogsTitle: 'Dogs Management',
    dogsSubtitle: 'Registered dogs',
    checkpointLogs: 'Checkpoint Logs',
    addDog: 'Register Dog',
    dogFood: 'Dog Food Log',
    addFoodLog: 'Dog Food',
    registerCheckpoint: 'Register Checkpoint',
    activeDeployments: 'Active Deployments',
    returnHistory: 'Return History',
    away: 'away', returned: 'returned',
    noActiveDeployments: 'No active deployments recorded for this date.',
    noReturnedDeployments: 'No returned deployments for this date.',
    markReturned: 'Mark Returned',
    location: 'Checkpoint Location',
    dispatchTime: 'Dispatch Time', returnTime: 'Return Time',
    selectDogs: 'Select Dogs', selectStaff: 'Select Staff',
    noDogsReg: 'No dogs registered', noStaffReg: 'No staff registered',
    breed: 'Breed', age: 'Age (Years)', vaccination: 'Vaccination Date',
    medicalExp: 'Medical Expense ($)',
    dogId: 'Dog ID', checkpoint: 'Checkpoint', dogsCol: 'Dogs', dogsTab: 'Dogs', dogsExpense: 'Dogs',
    dispatchCol: 'Dispatch', returnCol: 'Return',
    addDogTitle: 'Register New Dog',
    editDogTitle: 'Update Dog',
    deleteDogTitle: 'Confirm Delete',
    deleteDogMsg: 'Are you sure you want to delete this dog?',
    noDogsRegistered: 'No dogs registered',
    cowMeat: 'Cow Meat',
    milk: 'Milk',
    egg: 'Egg',
    cowMeatLabel: 'Cow Meat ($)',
    milkLabel: 'Milk ($)',
    eggLabel: 'Egg ($)',
    enterFoodLog: 'Enter Dog Food Cost',
    noFoodLogs: 'No food logs entered',
    totalFoodExpenses: 'Total Food Expenses',
    addCheckpointTitle: 'Register Checkpoint',
    editCheckpointTitle: 'Update Checkpoint',
    deleteCheckpointTitle: 'Confirm Delete',
    deleteCheckpointMsg: 'Are you sure you want to delete this checkpoint log?',
    activeDeploymentsLabel: 'Active Deployments',
    returnHistoryLabel: 'Return History',
    // Payroll
    payrollTitle: 'Payroll Management',
    payrollSub: 'Monthly payroll calculations',
    addPayroll: 'Add Payroll',
    selectMonth: 'Select Month:',
    totalNet: 'Total Net:',
    netSalary: 'Net Salary (Automatic)',
    netSalaryLabel: 'Net Salary',
    enterPayroll: 'Enter Payroll',
    basicSalary: 'Basic Salary ($)',
    overtime: 'Overtime ($)',
    bonus: 'Bonus ($)',
    deduction: 'Deduction ($)',
    selectStaffDefault: '-- Select Staff --',
    noPayrollLogs: 'No payroll records for this month',
    deletePayrollTitle: 'Confirm Delete',
    deletePayrollMsg: 'Are you sure you want to delete this payroll record?',
    // Vehicles
    vehiclesTitle: 'Vehicles — Fleet Costs',
    vehiclesSub: 'Manage vehicle fleet and expenses',
    addVehicle: 'Add Vehicle',
    addVehicleTitle: 'Add New Vehicle',
    editVehicleTitle: 'Update Vehicle',
    plateNumber: 'Plate Number',
    driver: 'Driver',
    fuel: 'Fuel',
    service: 'Service',
    repair: 'Repair',
    noVehicles: 'No vehicles registered',
    deleteVehicleTitle: 'Confirm Delete',
    deleteVehicleMsg: 'Are you sure you want to delete this vehicle?',
    // Finance
    financeTitle: 'Finance — Cash Flow',
    financeSub: 'Track income, expenses, and profits',
    addIncome: 'Add Income',
    addIncomeTitle: 'Add New Income',
    incomeSource: 'Income Source',
    registeredIncome: 'Registered Income',
    noIncome: 'No income records entered',
    deleteIncomeTitle: 'Confirm Delete',
    deleteIncomeMsg: 'Are you sure you want to delete this income record?',
    totalIncome: 'Total Income',
    totalExpenses: 'Total Expenses',
    profitLoss: 'Profit / Loss',
    profit: 'Profit',
    loss: 'Loss',
    // Reports
    reportsTitle: 'Reports',
    reportsSub: 'Company financial statement and exports',
    excelExport: 'Excel Export',
    printPdf: 'Print / PDF',
    companyReportHeader: 'SmartWay Security Company — Financial Report',
    reportDateLabel: 'Report Date:',
    // Users
    usersTitle: 'User Accounts',
    usersSub: 'System access accounts and permissions',
    noUsers: 'No user accounts found',
    accessLabel: 'Access:',
    // Login
    loginTitle: 'SmartWay Security',
    loginSub: 'Company Portal',
    loginButton: 'Sign In',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    loginError: 'Invalid Username or Password!',
    loginServerError: 'Could not connect to server. Check backend.',
    // Dashboard
    dashboardRealTime: 'Dashboard Real-Time',
    dashboardSubtitle: 'Live company metrics and recent logs',
    activeStaff: 'Active Staff',
    dogsTitleDashboard: 'Security Dogs',
    vehiclesDashboard: 'Vehicles',
    recentActivities: 'Recent Activities',
    noActivities: 'No activity recorded',
  },
  so: {
    // Nav
    dashboard: 'Xaruunta', staff: 'Diiwaanka Shaqaalaha', payroll: 'Mushaar',
    expenses: 'Kharashyada', dogs: 'Maamulka Eeyaha', vehicles: 'Baabuurta',
    finance: 'Maaliyadda', reports: 'Warbixinnada', users: 'Xisaabyada',
    logout: 'Ka Bax System-ka',
    // Common
    save: 'Kaydi', cancel: 'Ka Tanaasul', edit: 'Wax ka bedel', delete: 'Masax',
    add: 'Kudar', search: 'Raadi', loading: 'Waa la raraysaa...', saving: 'Kaydinaya...',
    confirm: 'Xaqiiji', yes: 'Haa, Masax', no: 'Jooji',
    areYouSure: 'Ma hubtaa?', deleting: 'Waa la masaxayaa...',
    noRecords: 'Wax lama helin', register: 'Diiwaangeli',
    update: 'Cusboonaysii', actions: 'Waxqabad', status: 'Xaaladda',
    date: 'Taariikhda', note: 'Xusuus-qor', amount: 'Lacagta ($)', total: 'Wadarta',
    close: 'Xidh', back: 'Dib', all: 'Dhammaan', today: 'Maanta',
    returnToToday: 'Ku noqo Maanta',
    automatic: 'Automaatig',
    connectionError: 'Xiriirka backend-ka la waayay!',
    // Staff page
    staffReg: 'Diiwaanka Shaqaalaha', staffCount: 'shaqaale oo diiwaangashan',
    addStaff: 'Diiwaangeli Staff', editStaff: 'Wax ka bedel Staff',
    name: 'Magaca Shaqaalaha', phone: 'Telefoonka', position: 'Xarafka Shaqada',
    salary: 'Mushaar ($)', startDate: 'Taariikhda Biloowga', active: 'Socda',
    inactive: 'La joojiyay', staffId: 'ID Shaqaalaha',
    deleteStaffTitle: 'Xaqiiji Tirtirka',
    deleteStaffMsg: 'Waxaad masaxaysaa shaqaalaha:',
    deleteStaffWarn: '⚠️ Tani waa mid xaqiiqda ah — dib loo celin karo!',
    stopDelete: 'Jooji',
    confirmDelete: 'Haa, Masax',
    searchPlaceholder: 'Raadi magac, ID, position...',
    // Expenses
    expensesTitle: 'Kharashyada — Kharashyada Shirkada',
    expensesSubtitle: 'Diiwaanso dhammaan kharashyada maalintii',
    addExpense: 'Geli Kharash',
    selectDate: 'Kharashka Maalinta (Select Date):',
    kitchenExpTotal: 'Kharashka Jikada ee Maalinta La Doortay',
    noKitchenExp: 'Ma jiraan kharashyo jiko oo la diiwaangaliyay taariikhdan',
    noExpenses: 'Ma jiraan kharashyo la diiwaangaliyay taariikhdan',
    kitchenModalTitle: 'Geli Kharashka Jikada',
    kitchenAmountLabel: 'Lacagta Jikada Maanta ($)',
    kitchenAmountHint: 'Geli kharashka guud ee jikada maanta — hal number kaliya',
    noteOptional: 'Xusuus-qor (Optional)',
    expenseSubcat: 'Nooca',
    expenseDesc: 'Sharaxaad',
    addExpenseFor: 'Geli Kharashka',
    editExpense: 'Wax ka bedel Kharash',
    deleteExpenseTitle: 'Xaqiiji Tirtirka',
    deleteExpenseMsg: 'Ma hubtaa inaad tirtirto kharashkan?',
    kitchenJiko: 'Jikada (Kitchen)',
    fuelShidaal: 'Shidaalka (Fuel)',
    repairsDayactir: 'Dayactirka (Repairs)',
    utilities: 'Adeegyada (Utilities)',
    others: 'Kale (Others)',
    // Dogs
    dogsTitle: 'Maamulka Eeyaha',
    dogsSubtitle: 'eey oo diiwaangashan',
    checkpointLogs: 'Diiwaanka Checkpoint-ka',
    addDog: 'Diiwaangeli Eey',
    dogFood: 'Cuntada Log',
    addFoodLog: 'Cuntada Eeyaha',
    registerCheckpoint: 'Diiwaangeli Checkpoint Cusub',
    activeDeployments: 'Kuwa Checkpoint-ka ku Maqan',
    returnHistory: 'Diiwaanka la soo celiyay',
    away: 'maqan', returned: 'soo noqotay',
    noActiveDeployments: 'Ma jiraan eeyo maqan oo la diiwaangaliyay taariikhdan.',
    noReturnedDeployments: 'Ma jiraan diiwaano ey la soo celiyay taariikhdan.',
    markReturned: 'Soo Celi',
    location: 'Goobta (Checkpoint Location)',
    dispatchTime: 'Waqtiga la qaaday (Aroortii)', returnTime: 'Waqtiga la soo celiyay (Galabtii)',
    selectDogs: 'Dooro Eeyaha (Dogs)', selectStaff: 'Dooro Shaqaalaha (Staff)',
    noDogsReg: 'Ma jiraan eeyo diiwaangashan', noStaffReg: 'Ma jiraan shaqaale diiwaangashan',
    breed: 'Nooca (Breed)', age: "Da'da (Sano)", vaccination: 'Taariikhda Tallaalka',
    medicalExp: 'Caafimaad ($)',
    dogId: 'Dog ID', checkpoint: 'Checkpoint', dogsCol: 'Eeyaha', dogsTab: 'Eeyaha', dogsExpense: 'Eeyaha',
    dispatchCol: 'Aroortii', returnCol: 'Galabtii',
    addDogTitle: 'Diiwaangeli Eey Cusub',
    editDogTitle: 'Cusboonaysii Eeyga',
    deleteDogTitle: 'Xaqiiji Tirtirka',
    deleteDogMsg: 'Ma hubtaa inaad tirtirto eeygan?',
    noDogsRegistered: 'Wax eey ah lama diiwaangelinin',
    cowMeat: 'Hilib Lo\'',
    milk: 'Caano',
    egg: 'Ukun',
    cowMeatLabel: 'Hilib Lo\' ($)',
    milkLabel: 'Caano ($)',
    eggLabel: 'Ukun ($)',
    enterFoodLog: 'Geli Cuntada Eeyaha',
    noFoodLogs: 'Wax cunto ah lama gelin',
    totalFoodExpenses: 'Wadarta Kharashka Cuntada',
    addCheckpointTitle: 'Diiwaangeli Checkpoint Cusub',
    editCheckpointTitle: 'Cusboonaysii Checkpoint',
    deleteCheckpointTitle: 'Xaqiiji Tirtirka',
    deleteCheckpointMsg: 'Ma hubtaa inaad tirtirto diiwaankan checkpoint?',
    activeDeploymentsLabel: 'Kuwa Checkpoint-ka ku Maqan',
    returnHistoryLabel: 'Diiwaanka la soo celiyay',
    // Payroll
    payrollTitle: 'Maamulka Musharka',
    payrollSub: 'Xisaab-mushaarka bil kasta',
    addPayroll: 'Geli Mushaar',
    selectMonth: 'Xul Bisha:',
    totalNet: 'Wadarta Net:',
    netSalary: 'Musharka Net (Automatic)',
    netSalaryLabel: 'Musharka Net',
    enterPayroll: 'Diiwaangeli Mushaar',
    basicSalary: 'Musharka Asasiga ah ($)',
    overtime: 'Saacado Dheeraad ($)',
    bonus: 'Haddiyad ($)',
    deduction: 'Goyn ($)',
    selectStaffDefault: '-- Dooro Shaqaalaha --',
    noPayrollLogs: 'Mushaarka bishan lama gelin',
    deletePayrollTitle: 'Xaqiiji Tirtirka',
    deletePayrollMsg: 'Ma hubtaa inaad tirtirto diiwaankan mushaarka?',
    // Vehicles
    vehiclesTitle: 'Gaadiidka Shirkada',
    vehiclesSub: 'Maamul gaadiidka iyo kharashyadooda',
    addVehicle: 'Geli Baabuur',
    addVehicleTitle: 'Geli Baabuur Cusub',
    editVehicleTitle: 'Cusboonaysii Baabuurka',
    plateNumber: 'Lambarka Baabuurka',
    driver: 'Wadaha',
    fuel: 'Shidaal',
    service: 'Service',
    repair: 'Dayactir',
    noVehicles: 'Wax baabuur ah lama gelin',
    deleteVehicleTitle: 'Xaqiiji Tirtirka',
    deleteVehicleMsg: 'Ma hubtaa inaad tirtirto baabuurkan?',
    // Finance
    financeTitle: 'Maaliyadda Shirkada',
    financeSub: 'Dakhliga, Kharashka, iyo Faa\'iidada',
    addIncome: 'Geli Dakhli',
    addIncomeTitle: 'Geli Dakhli Cusub',
    incomeSource: 'Isha Dakhliga',
    registeredIncome: 'Dakhliga Diiwaangashan (Income)',
    noIncome: 'Wax dakhli ah lama gelin',
    deleteIncomeTitle: 'Xaqiiji Tirtirka',
    deleteIncomeMsg: 'Ma hubtaa inaad tirtirto dakhligan?',
    totalIncome: 'Dakhliga Guud (Income)',
    totalExpenses: 'Kharashka Guud (Expenses)',
    profitLoss: 'Faa\'iido / Khasaare',
    profit: 'Faa\'iido',
    loss: 'Khasaare',
    // Reports
    reportsTitle: 'Warbixinnada',
    reportsSub: 'Warbixinta maaliyadeed ee shirkada',
    excelExport: 'Excel Export',
    printPdf: 'Print / PDF',
    companyReportHeader: 'SmartWay Security Company — Financial Report',
    reportDateLabel: 'Warbixinta:',
    // Users
    usersTitle: 'Xisaabyada',
    usersSub: 'Xisaabyada nidaamka',
    noUsers: 'Wax users ah lama helin',
    accessLabel: 'Heerka Access:',
    // Login
    loginTitle: 'SmartWay Security',
    loginSub: 'Nidaamka Maamulka Shirkada',
    loginButton: 'Gali System-ka',
    usernameLabel: 'Username',
    passwordLabel: 'Password',
    loginError: 'Username ama Password khaldan!',
    loginServerError: 'Server kuma xidna. Hubi backend-ka.',
    // Dashboard
    dashboardRealTime: 'Dashboard Real-Time',
    dashboardSubtitle: 'Xaaladda guud ee shirkada isaga oo toos ah',
    activeStaff: 'Staff Firfircoon',
    dogsTitleDashboard: 'Eeyaha Ilaalada',
    vehiclesDashboard: 'Gaadiidka',
    recentActivities: 'Dhaqdhaqaaqii U Dambeeyay',
    noActivities: 'Wax dhaqdhaqaaq ah ma jiro',
  },
} as const

type Theme = 'dark' | 'light'

interface AppCtx {
  lang: Lang
  setLang: (l: Lang) => void
  theme: Theme
  toggleTheme: () => void
  t: (typeof T)[Lang]
}

const Ctx = createContext<AppCtx>({
  lang: 'so', setLang: () => {}, theme: 'light', toggleTheme: () => {}, t: T.so,
})

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('so')
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const savedLang = localStorage.getItem('sw_lang') as Lang
    const savedTheme = localStorage.getItem('sw_theme') as Theme
    if (savedLang) setLangState(savedLang)
    // Force new Blue+White brand theme once
    if (localStorage.getItem('sw_brand') !== 'v2') {
      localStorage.setItem('sw_brand', 'v2')
      localStorage.setItem('sw_theme', 'light')
      setTheme('light')
    } else if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'light') {
      root.classList.add('light'); root.classList.remove('dark')
    } else {
      root.classList.add('dark'); root.classList.remove('light')
    }
  }, [theme])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('sw_lang', l)
  }

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('sw_theme', next)
      return next
    })
  }

  return (
    <Ctx.Provider value={{ lang, setLang, theme, toggleTheme, t: T[lang] }}>
      {children}
    </Ctx.Provider>
  )
}

export const useApp = () => useContext(Ctx)
