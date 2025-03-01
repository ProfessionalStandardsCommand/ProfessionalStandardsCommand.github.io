document.addEventListener('DOMContentLoaded', async () => {
    const list = document.getElementById('infraction-list');
    const details = document.getElementById('infraction-details');
    const toggleButton = document.getElementById('toggle-mode');

    const filterUsername = document.getElementById('filter-username');
    const filterReason = document.getElementById('filter-reason');
    const filterNotes = document.getElementById('filter-notes');
    const filterOutcome = document.getElementById('filter-outcome');
    const filterAppealable = document.getElementById('filter-appealable');

    let allInfractions = [];

    toggleButton.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
    });

    async function fetchInfractions() {
        try {
            const response = await fetch('http://localhost:3000/infractions');
            allInfractions = await response.json(); 
            filterInfractions(); 
        } catch (error) {
            console.error('Error fetching infractions:', error);
        }
    }

    function filterInfractions() {
        const filteredInfractions = allInfractions.filter(infraction => {
            return (
                infraction.userName.toLowerCase().includes(filterUsername.value.toLowerCase()) &&
                infraction.reason.toLowerCase().includes(filterReason.value.toLowerCase()) &&
                infraction.notes.toLowerCase().includes(filterNotes.value.toLowerCase()) &&
                infraction.outcome.toLowerCase().includes(filterOutcome.value.toLowerCase()) &&
                (filterAppealable.checked ? infraction.appealable : true)
            );
        });
        displayInfractions(filteredInfractions);
    }

    function displayInfractions(infractions) {
        list.innerHTML = '';

        infractions.forEach(infraction => {
            const li = document.createElement('li');
            li.textContent = `${infraction.userName} - ${infraction.reason}`;
            li.dataset.id = infraction._id;
            li.classList.add('infraction-item');

            const outcomeText = infraction.outcome.toLowerCase();
            if (outcomeText.includes('notice')) {
                li.style.backgroundColor = 'rgba(0, 255, 0, 0.15)'; 
            } else if (outcomeText.includes('warning')) {
                li.style.backgroundColor = 'rgba(255, 255, 0, 0.15)'; 
            } else if (outcomeText.includes('minutes')) {
                    li.style.backgroundColor = 'rgba(0, 38, 255, 0.15)';
            } else if (outcomeText.includes('shift')) {
                    li.style.backgroundColor = 'rgba(0, 38, 255, 0.15)'; 
            } else if (outcomeText.includes('removed')) {
                li.style.backgroundColor = 'rgba(0, 38, 255, 0.15)'; 
            } else if (
                outcomeText.includes('strike') ||
                outcomeText.includes('stike') ||
                outcomeText.includes('termination') ||
                outcomeText.includes('blacklist') ||
                outcomeText.includes('demotion') ||
                outcomeText.includes('suspension')
            ) {
                li.style.backgroundColor = 'rgba(255, 0, 0, 0.15)'; 
            }

            li.addEventListener('click', () => showInfractionDetails(infraction));
            list.appendChild(li);
        });
    }

    function showInfractionDetails(infraction) {
        details.innerHTML = `
            <h2>Details</h2>
            <p><strong>User:</strong> ${infraction.userName} (${infraction.userId})</p>
            <p><strong>Reason:</strong> ${infraction.reason}</p>
            <p><strong>Outcome:</strong> ${infraction.outcome}</p>
            <p><strong>Appealable:</strong> ${infraction.appealable ? 'Yes' : 'No'}</p>
            <p><strong>Notes:</strong> ${infraction.notes}</p>
            <p><strong>Issued By:</strong> ${infraction.issuedByName} (${infraction.issuedBy})</p>
            <p><strong>Issued At:</strong> ${new Date(infraction.issuedAt).toLocaleString()}</p>
            <button class="edit-btn" id="edit-button">Edit</button>
            <button class="delete-btn" id="delete-button">Delete</button>
        `;

        document.getElementById('delete-button').addEventListener('click', async () => {
            const password = prompt('Enter the admin password:');
            if (!password) return alert('Password required to delete.');
        
            if (confirm('Are you sure you want to delete this infraction?')) {
                const res = await fetch(`http://localhost:3000/infractions/${infraction._id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
        
                if (res.ok) {
                    alert('Infraction deleted successfully');
                    document.querySelector(`li[data-id="${infraction._id}"]`)?.remove();
                    details.innerHTML = `<p>Select an infraction to view details.</p>`;
                } else {
                    alert('Failed to delete infraction: Incorrect password');
                }
            }
        });
        
        document.getElementById('edit-button').addEventListener('click', () => {
            details.innerHTML = `
                <h2>Edit Infraction</h2>
                <label>Reason: <input type="text" id="edit-reason" value="${infraction.reason}"></label><br>
                <label>Outcome: <input type="text" id="edit-outcome" value="${infraction.outcome}"></label><br>
                <label>Appealable: <input type="checkbox" id="edit-appealable" ${infraction.appealable ? 'checked' : ''}></label><br>
                <label>Notes: <textarea id="edit-notes">${infraction.notes}</textarea></label><br>
                <button class="edit-btn" id="save-edit">Save</button>
                <button id="cancel-edit">Cancel</button>
            `;
            document.getElementById('cancel-edit').addEventListener('click', () => showInfractionDetails(infraction));

            document.getElementById('save-edit').addEventListener('click', async () => {
                const password = prompt('Enter the admin password:');
                if (!password) return alert('Password required to edit.');
            
                const updatedInfraction = {
                    ...infraction,
                    reason: document.getElementById('edit-reason').value,
                    outcome: document.getElementById('edit-outcome').value,
                    appealable: document.getElementById('edit-appealable').checked,
                    notes: document.getElementById('edit-notes').value,
                    password
                };
            
                const res = await fetch(`http://localhost:3000/infractions/${infraction._id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedInfraction)
                });
            
                if (res.ok) {
                    const updated = await res.json();
                    alert('Infraction updated successfully');
                    showInfractionDetails(updated);
                    fetchInfractions();
                } else {
                    alert('Failed to update infraction: Incorrect password');
                }
            });
        });
    }

    // Auto-refresh every 3 seconds
    setInterval(fetchInfractions, 3000);

    await fetchInfractions();

    [filterUsername, filterReason, filterNotes, filterOutcome].forEach(filter => {
        filter.addEventListener('input', filterInfractions);
    });

    filterAppealable.addEventListener('change', filterInfractions);
});
