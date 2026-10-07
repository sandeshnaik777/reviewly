import { MainCategory } from '../../types/index.js';

export interface CategoryDefinition {
  name: MainCategory;
  subcategories: string[];
  defaultQuestions: { key: string; label: string }[];
}

export const CATEGORIES_CATALOG: Record<MainCategory, CategoryDefinition> = {
  'FOOD & HOSPITALITY': {
    name: 'FOOD & HOSPITALITY',
    subcategories: [
      'Restaurant',
      'Café',
      'Bakery',
      'Fast Food',
      'Food Truck',
      'Cloud Kitchen',
      'Catering Service',
      'Juice / Shake Shop',
      'Sweet Shop',
      'Ice Cream Shop',
      'Street Food',
      'Food Court',
      'Bar / Pub',
      'Hotel / Resort',
      'Homestay',
    ],
    defaultQuestions: [
      { key: 'food_quality', label: 'Food Quality' },
      { key: 'taste', label: 'Taste & Flavors' },
      { key: 'service', label: 'Service & Hospitality' },
      { key: 'cleanliness', label: 'Cleanliness & Hygiene' },
      { key: 'ambience', label: 'Ambience & Atmosphere' },
      { key: 'value_for_money', label: 'Value for Money' },
    ],
  },
  RETAIL: {
    name: 'RETAIL',
    subcategories: [
      'Supermarket',
      'Grocery Store',
      'Clothing Store',
      'Footwear Store',
      'Electronics Store',
      'Mobile Store',
      'Jewellery Store',
      'Furniture Store',
      'Gift Shop',
      'Book Store',
      'Pharmacy',
      'Cosmetic Store',
      'General Store',
      'Department Store',
      'Shopping Mall',
    ],
    defaultQuestions: [
      { key: 'product_quality', label: 'Product Quality' },
      { key: 'staff_behaviour', label: 'Staff Behaviour & Helpfulness' },
      { key: 'store_cleanliness', label: 'Store Cleanliness' },
      { key: 'product_variety', label: 'Product Variety & Selection' },
      { key: 'pricing', label: 'Price & Value' },
      { key: 'overall_experience', label: 'Overall Shopping Experience' },
    ],
  },
  SERVICES: {
    name: 'SERVICES',
    subcategories: [
      'Salon',
      'Barber Shop',
      'Spa',
      'Beauty Parlour',
      'Laundry',
      'Car Wash',
      'Repair Shop',
      'Photography Studio',
      'Printing Shop',
      'Travel Agency',
      'Real Estate Agency',
      'Digital Marketing Agency',
      'Consulting Business',
      'Cleaning Service',
      'Home Services',
    ],
    defaultQuestions: [
      { key: 'service_quality', label: 'Service Quality' },
      { key: 'staff_behaviour', label: 'Staff Behaviour & Courtesy' },
      { key: 'cleanliness', label: 'Cleanliness & Setup' },
      { key: 'professionalism', label: 'Professionalism & Punctuality' },
      { key: 'value_for_money', label: 'Value for Money' },
      { key: 'overall_experience', label: 'Overall Experience' },
    ],
  },
  'HEALTH & WELLNESS': {
    name: 'HEALTH & WELLNESS',
    subcategories: [
      'Clinic',
      'Dental Clinic',
      'Hospital',
      'Diagnostic Centre',
      'Physiotherapy Centre',
      'Gym',
      'Fitness Centre',
      'Yoga Studio',
      'Wellness Centre',
    ],
    defaultQuestions: [
      { key: 'doctor_staff', label: 'Doctor & Staff Care' },
      { key: 'cleanliness', label: 'Cleanliness & Sanitization' },
      { key: 'waiting_time', label: 'Waiting Time & Queue Management' },
      { key: 'professionalism', label: 'Professionalism & Expertise' },
      { key: 'communication', label: 'Communication & Explanation' },
      { key: 'overall_experience', label: 'Overall Experience' },
    ],
  },
  EDUCATION: {
    name: 'EDUCATION',
    subcategories: [
      'School',
      'College',
      'Coaching Centre',
      'Training Institute',
      'Skill Centre',
      'Music Academy',
      'Dance Academy',
    ],
    defaultQuestions: [
      { key: 'teaching_quality', label: 'Teaching & Faculty Quality' },
      { key: 'curriculum', label: 'Curriculum & Practical Learning' },
      { key: 'facilities', label: 'Facilities & Environment' },
      { key: 'support', label: 'Student Support & Guidance' },
      { key: 'value_for_money', label: 'Value for Money' },
      { key: 'overall_experience', label: 'Overall Experience' },
    ],
  },
  ENTERTAINMENT: {
    name: 'ENTERTAINMENT',
    subcategories: [
      'Cinema',
      'Gaming Centre',
      'Amusement Park',
      'Event Company',
      'Tourist Attraction',
    ],
    defaultQuestions: [
      { key: 'entertainment_value', label: 'Fun & Entertainment Quality' },
      { key: 'facilities', label: 'Facilities & Equipment' },
      { key: 'staff_support', label: 'Staff & Safety Support' },
      { key: 'cleanliness', label: 'Cleanliness' },
      { key: 'pricing', label: 'Ticket Price & Food Value' },
      { key: 'overall_experience', label: 'Overall Experience' },
    ],
  },
  PROFESSIONAL: {
    name: 'PROFESSIONAL',
    subcategories: [
      'Lawyer',
      'Accountant',
      'Architect',
      'Software Company',
      'IT Services',
      'Freelancer',
      'Other Professional Service',
    ],
    defaultQuestions: [
      { key: 'expertise', label: 'Expertise & Problem Solving' },
      { key: 'communication', label: 'Clear Communication & Timeliness' },
      { key: 'quality_of_work', label: 'Quality of Deliverables' },
      { key: 'professionalism', label: 'Integrity & Professionalism' },
      { key: 'value_for_money', label: 'Value for Money' },
      { key: 'recommendation', label: 'Likelihood to Recommend' },
    ],
  },
  OTHER: {
    name: 'OTHER',
    subcategories: ['General Business', 'Custom Service', 'Other'],
    defaultQuestions: [
      { key: 'service_quality', label: 'Product / Service Quality' },
      { key: 'staff_courtesy', label: 'Staff Courtesy' },
      { key: 'speed_of_service', label: 'Speed of Service' },
      { key: 'cleanliness', label: 'Cleanliness & Presentation' },
      { key: 'pricing', label: 'Fair Pricing' },
      { key: 'overall_experience', label: 'Overall Experience' },
    ],
  },
};

export function getDefaultQuestionsForCategory(category: MainCategory, subcategory?: string) {
  // If Gym/Fitness under Health & Wellness
  if (subcategory && (subcategory.toLowerCase().includes('gym') || subcategory.toLowerCase().includes('fitness'))) {
    return [
      { key: 'equipment', label: 'Equipment & Cleanliness' },
      { key: 'cleanliness', label: 'Hygiene & Facilities' },
      { key: 'staff', label: 'Trainers & Staff Support' },
      { key: 'training', label: 'Workout Environment' },
      { key: 'facilities', label: 'Locker Rooms & Amenities' },
      { key: 'value_for_money', label: 'Value for Money' },
    ];
  }
  // If Hotel/Resort under Food & Hospitality
  if (subcategory && (subcategory.toLowerCase().includes('hotel') || subcategory.toLowerCase().includes('resort') || subcategory.toLowerCase().includes('homestay'))) {
    return [
      { key: 'room_quality', label: 'Room Quality & Comfort' },
      { key: 'cleanliness', label: 'Cleanliness & Housekeeping' },
      { key: 'staff', label: 'Staff Hospitality' },
      { key: 'location', label: 'Location & Accessibility' },
      { key: 'amenities', label: 'Amenities & Breakfast' },
      { key: 'value_for_money', label: 'Value for Money' },
    ];
  }

  const def = CATEGORIES_CATALOG[category] || CATEGORIES_CATALOG['OTHER'];
  return def.defaultQuestions;
}
