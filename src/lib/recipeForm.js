export function emptyRecipe() {
  return {
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    cooking_minutes: '30',
    image_url: ''
  };
}

export function validateRecipe(form) {
  if (
    !form.title.trim() ||
    !form.ingredients.trim() ||
    !form.instructions.trim()
  ) {
    throw new Error(
      'Попълни заглавие, продукти и инструкции.'
    );
  }

  const minutes = Number(form.cooking_minutes);

  if (
    !Number.isInteger(minutes) ||
    minutes < 1 ||
    minutes > 10000
  ) {
    throw new Error(
      'Въведи валидно време за приготвяне.'
    );
  }

  if (form.image_url.trim()) {
    try {
      const url = new URL(form.image_url.trim());

      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error('Невалиден протокол');
      }
    } catch {
      throw new Error(
        'Въведи валиден URL на снимка.'
      );
    }
  }

  return {
    title: form.title.trim(),
    description: form.description.trim(),
    ingredients: form.ingredients.trim(),
    instructions: form.instructions.trim(),
    cooking_minutes: minutes,
    image_url: form.image_url.trim() || null
  };
}