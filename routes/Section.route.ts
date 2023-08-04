import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;
const route = '/sections';

app.use(bodyParser.json());

app.get(route, (req: Request, res: Response) => {

	res.json();
});

// app.post('/items', (req: Request, res: Response) => {
//   const newItem: string = req.body.item;
//   items.push(newItem);
//   res.json(items);
// });

// const itemId: number = parseInt(req.params.id);
// const updatedItem: string = req.body.item;

// if (isNaN(itemId) || itemId < 0 || itemId >= items.length) {
//   return res.status(400).json({ message: 'Invalid item ID' });
// }

// items[itemId] = updatedItem;
// res.json(items);
// });

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
