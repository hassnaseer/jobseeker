import 'reflect-metadata';
import dataSource from '@/database/data-source';
import { Category } from '@/modules/categories/entities/category.entity';

const CATEGORY_TREE = [
  {
    name: 'Onsite jobs',
    slug: 'onsite-jobs',
    description: 'Jobs that require working from a company office or location.',
    sortOrder: 10,
    children: [
      { name: 'Software engineering', slug: 'onsite-software-engineering', description: 'Onsite development and engineering roles.' },
      { name: 'Design', slug: 'onsite-design', description: 'Onsite product, UX, and visual design work.' },
      { name: 'Marketing', slug: 'onsite-marketing', description: 'Onsite marketing, growth, and brand roles.' },
      { name: 'Sales', slug: 'onsite-sales', description: 'Onsite sales and business development positions.' },
      { name: 'Operations', slug: 'onsite-operations', description: 'Onsite operations, office, and program roles.' },
      { name: 'Customer support', slug: 'onsite-customer-support', description: 'Onsite support and success roles.' },
    ],
  },
  {
    name: 'Remote jobs',
    slug: 'remote-jobs',
    description: 'Jobs that can be done from anywhere, without a fixed office location.',
    sortOrder: 20,
    children: [
      { name: 'Software engineering', slug: 'remote-software-engineering', description: 'Remote development and engineering roles.' },
      { name: 'Design', slug: 'remote-design', description: 'Remote product, UX, and visual design work.' },
      { name: 'Marketing', slug: 'remote-marketing', description: 'Remote marketing, growth, and communications roles.' },
      { name: 'Sales', slug: 'remote-sales', description: 'Remote sales and business development positions.' },
      { name: 'Operations', slug: 'remote-operations', description: 'Remote operations, program, and project roles.' },
      { name: 'Customer support', slug: 'remote-customer-support', description: 'Remote support and success roles.' },
    ],
  },
];

async function upsertCategory(categoryRepository: ReturnType<typeof dataSource.getRepository>, data: {
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string | null;
  sortOrder?: number;
}) {
  const existing = await categoryRepository.findOne({ where: { slug: data.slug } });
  if (existing) {
    existing.name = data.name;
    existing.parentId = data.parentId ?? null;
    existing.description = data.description ?? existing.description;
    existing.sortOrder = data.sortOrder ?? existing.sortOrder;
    existing.isActive = true;
    return categoryRepository.save(existing);
  }

  const category = categoryRepository.create({
    name: data.name,
    slug: data.slug,
    parentId: data.parentId ?? null,
    description: data.description ?? null,
    sortOrder: data.sortOrder ?? 0,
    isActive: true,
  });

  return categoryRepository.save(category);
}

async function main() {
  await dataSource.initialize();

  if (process.env.NODE_ENV !== 'production') {
    await dataSource.synchronize();
  }

  const categoryRepository = dataSource.getRepository(Category);

  for (const parentData of CATEGORY_TREE) {
    const parent = await upsertCategory(categoryRepository, {
      name: parentData.name,
      slug: parentData.slug,
      description: parentData.description,
      sortOrder: parentData.sortOrder,
    });

    for (const childData of parentData.children) {
      await upsertCategory(categoryRepository, {
        name: childData.name,
        slug: childData.slug,
        parentId: parent.id,
        description: childData.description,
        sortOrder: parentData.children.indexOf(childData) * 10,
      });
    }
  }

  console.log('Seeded onsite and remote top-tier categories with subcategories.');
  await dataSource.destroy();
}

main().catch((error) => {
  console.error('Category seeding failed:', error);
  process.exit(1);
});
