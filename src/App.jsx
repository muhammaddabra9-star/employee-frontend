
import { useState, useEffect } from 'react'
import './App.css'
const API = 'https://employeemanagementsystemrestapi.onrender.com/api'
function App() {
  const [page, setPage] = useState('Dashboard')
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    departmentId: ''
  })

  async function loadEmployees() {
    const response = await fetch(`${API}/employees`)
    if (!response.ok) throw new Error('Could not load employees')
    const data = await response.json()
    setEmployees(data)
  }

  async function loadDepartments() {
    const response = await fetch(`${API}/departments`)
    if (!response.ok) throw new Error('Could not load departments')
    const data = await response.json()
    setDepartments(data)
  }

  useEffect(() => {
    loadEmployees().catch(console.error)
    loadDepartments().catch(console.error)
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()

    const selectedDepartment = departments.find(
      dept => dept.id === Number(form.departmentId)
    )

    const employeeData = {
      firstName: form.firstName,
      lastName: form.lastName,
      department: selectedDepartment
    }

    const url = editingId
      ? `${API}/employees/${editingId}`
      : `${API}/employees`

    const method = editingId ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employeeData)
    })

    if (!response.ok) {
      alert('Could not save employee')
      return
    }

    await loadEmployees()
    setShowForm(false)
    setEditingId(null)
    setForm({ firstName: '', lastName: '', departmentId: '' })
  }

  function editEmployee(employee) {
    setForm({
      firstName: employee.firstName,
      lastName: employee.lastName,
      departmentId: employee.department?.id?.toString() || ''
    })
    setEditingId(employee.id)
    setShowForm(true)
  }

  async function deleteEmployee(id) {
    if (!window.confirm('Delete this employee?')) return

    const response = await fetch(`${API}/employees/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      alert('Could not delete employee')
      return
    }

    await loadEmployees()
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>EmployEase</h2>

        {['Dashboard', 'Employees', 'Departments'].map(item => (
          <p
            key={item}
            className={page === item ? 'active' : ''}
            onClick={() => {
              setPage(item)
              setShowForm(false)
            }}
          >
            {item}
          </p>
        ))}
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>{page}</h1>
            <p>Manage your workforce in one place.</p>
          </div>

          {page === 'Employees' && (
            <button onClick={() => {
              setForm({ firstName: '', lastName: '', departmentId: '' })
              setEditingId(null)
              setShowForm(true)
            }}>
              + Add Employee
            </button>
          )}
        </header>

        {page === 'Dashboard' && (
          <section className="stats">
            <div className="stat-card">
              <p>Total Employees</p>
              <h2>{employees.length}</h2>
            </div>
            <div className="stat-card">
              <p>Departments</p>
              <h2>{departments.length}</h2>
            </div>
          </section>
        )}

        {page === 'Departments' && (
          <section className="employees">
            <h2>Departments</h2>
            {departments.map(dept => (
              <p key={dept.id}>{dept.name}</p>
            ))}
          </section>
        )}

        {page === 'Employees' && (
          <section className="employees">
            <h2>Employee Records</h2>

            {showForm && (
              <form onSubmit={handleSubmit} className="employee-form">
                <input
                  placeholder="First Name"
                  value={form.firstName}
                  onChange={e => setForm({
                    ...form, firstName: e.target.value
                  })}
                  required
                />

                <input
                  placeholder="Last Name"
                  value={form.lastName}
                  onChange={e => setForm({
                    ...form, lastName: e.target.value
                  })}
                  required
                />

                <select
                  value={form.departmentId}
                  onChange={e => setForm({
                    ...form, departmentId: e.target.value
                  })}
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>

                <button type="submit">
                  {editingId ? 'Update Employee' : 'Save Employee'}
                </button>

                <button type="button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </form>
            )}

            <table>
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td>{emp.firstName}</td>
                    <td>{emp.lastName}</td>
                    <td>{emp.department?.name || 'Unassigned'}</td>
                    <td>
                      <button onClick={() => editEmployee(emp)}>Edit</button>
                      {' '}
                      <button onClick={() => deleteEmployee(emp.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {employees.length === 0 && <p>No employees found.</p>}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
