import { Router } from 'express';
import { StorageService } from '../services/storage.js';

export const labsRouter = Router();
const storage = StorageService.getInstance();

// GET /api/labs - browse & search labs
labsRouter.get('/', (req, res) => {
  const { q, department, equipment, facility } = req.query;
  let labs = storage.getAllLabs();

  if (department && typeof department === 'string') {
    const depLower = department.toLowerCase();
    labs = labs.filter(l => l.department.toLowerCase().includes(depLower));
  }

  if (equipment && typeof equipment === 'string') {
    const eqLower = equipment.toLowerCase();
    labs = labs.filter(l => l.equipment.some(e => e.toLowerCase().includes(eqLower)));
  }

  if (facility && typeof facility === 'string') {
    const facLower = facility.toLowerCase();
    labs = labs.filter(l => l.facilities.some(f => f.toLowerCase().includes(facLower)));
  }

  if (q && typeof q === 'string') {
    const query = q.toLowerCase();
    labs = labs.filter(l => 
      l.name.toLowerCase().includes(query) ||
      l.department.toLowerCase().includes(query) ||
      l.description.toLowerCase().includes(query) ||
      l.purpose.toLowerCase().includes(query) ||
      l.building.toLowerCase().includes(query) ||
      l.roomNumber.toLowerCase().includes(query) ||
      l.equipment.some(e => e.toLowerCase().includes(query)) ||
      l.facilities.some(f => f.toLowerCase().includes(query))
    );
  }

  res.json({ success: true, count: labs.length, laboratories: labs });
});

// GET /api/labs/:id - detailed laboratory profile
labsRouter.get('/:id', (req, res) => {
  const lab = storage.getLabById(req.params.id);
  if (!lab) {
    return res.status(404).json({ success: false, error: 'Laboratory not found.' });
  }
  res.json({ success: true, laboratory: lab });
});
