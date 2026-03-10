import { useState, useMemo, useEffect, useRef } from 'react';
import lottie, { AnimationItem } from 'lottie-web';
import spinnerData from '../../assets/lottie/spinner.json';
import { TagInput } from '../ui/TagInput';
import type { Tag } from '../../hooks/use-tags';
import './ScreenPreferences.css';

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'dairy-free', label: 'Dairy-Free' },
  { id: 'halal', label: 'Halal' },
  { id: 'none', label: 'None' },
];

const DIET_AVOID_MAP: Record<string, string[]> = {
  vegetarian:    ['chicken', 'beef', 'pork', 'fish', 'lamb'],
  vegan:         ['chicken', 'beef', 'pork', 'fish', 'lamb', 'eggs', 'dairy', 'honey'],
  'gluten-free': ['wheat', 'barley', 'rye', 'bread', 'pasta'],
  'dairy-free':  ['milk', 'cheese', 'butter', 'yoghurt', 'cream'],
  halal:         ['pork', 'bacon', 'lard', 'gelatin'],
};

// Maps UI food tag IDs to backend food category names.
const FOOD_TO_CATEGORY: Record<string, string> = {
  chicken:       'lean_protein',
  rice:          'grains',
  eggs:          'protein',
  salmon:        'fish',
  tuna:          'fish',
  broccoli:      'vegetables',
  oats:          'grains',
  'greek-yogurt':'dairy',
  'sweet-potato':'carb_source',
  banana:        'fruit',
  dairy:         'dairy',
  'eggs-avoid':  'protein',
};

const ENJOY_SUGGESTIONS = [
  { id: 'chicken',       label: 'Chicken'      },
  { id: 'rice',          label: 'Rice'         },
  { id: 'eggs',          label: 'Eggs'         },
  { id: 'salmon',        label: 'Salmon'       },
  { id: 'broccoli',      label: 'Broccoli'     },
  { id: 'oats',          label: 'Oats'         },
  { id: 'greek-yogurt',  label: 'Greek Yogurt' },
  { id: 'sweet-potato',  label: 'Sweet Potato' },
  { id: 'tuna',          label: 'Tuna'         },
  { id: 'banana',        label: 'Banana'       },
];

const AVOID_SUGGESTIONS = [
  { id: 'dairy',      label: 'Dairy'     },
  { id: 'eggs-avoid', label: 'Eggs'      },
  { id: 'salmon',     label: 'Fish'      },
  { id: 'oats',       label: 'Grains'    },
  { id: 'chicken',    label: 'Meat'      },
  { id: 'banana',     label: 'Fruit'     },
];

interface ScreenPreferencesProps {
  onBack: () => void;
  onSubmit: (prefs: { restrictions: string[]; enjoyCategories: string[]; avoidCategories: string[] }) => Promise<void>;
  error?: string | null;
}

export default function ScreenPreferences({ onBack, onSubmit, error }: ScreenPreferencesProps) {
  const [restrictions, setRestrictions] = useState<string[]>([]);
  const [enjoyTags, setEnjoyTags] = useState<Tag[]>([]);
  const [avoidTags, setAvoidTags] = useState<Tag[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const lottieAnim = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (isSubmitting) {
      const container = document.getElementById('lottie-spinner');
      if (container) {
        lottieAnim.current = lottie.loadAnimation({
          container,
          animationData: spinnerData,
          loop: true,
          autoplay: true,
          renderer: 'svg',
        });
      }
    } else {
      lottieAnim.current?.destroy();
      lottieAnim.current = null;
    }
    return () => {
      lottieAnim.current?.destroy();
      lottieAnim.current = null;
    };
  }, [isSubmitting]);

  // Compute auto-populated avoid tags from active dietary restrictions.
  // Merges all mapped items, deduplicates by id.
  const autoAvoidIds = useMemo<Set<string>>(() => {
    const ids = new Set<string>();
    for (const r of restrictions) {
      for (const food of (DIET_AVOID_MAP[r] ?? [])) {
        ids.add(food);
      }
    }
    return ids;
  }, [restrictions]);

  // Build the controlled tag list: auto-tags merged with any user-added tags,
  // preserving user tags that aren't in the auto set.
  const controlledAvoidTags = useMemo<Tag[]>(() => {
    const autoTags: Tag[] = Array.from(autoAvoidIds).map((id) => ({
      id,
      label: id.charAt(0).toUpperCase() + id.slice(1),
    }));
    const userOnlyTags = avoidTags.filter((t) => !autoAvoidIds.has(t.id));
    return [...autoTags, ...userOnlyTags];
  }, [autoAvoidIds, avoidTags]);

  const toggleRestriction = (id: string) => {
    if (id === 'none') {
      setRestrictions(restrictions.includes('none') ? [] : ['none']);
      return;
    }
    setRestrictions((prev) => {
      const without = prev.filter((r) => r !== 'none');
      return without.includes(id) ? without.filter((r) => r !== id) : [...without, id];
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const toCategories = (tags: Tag[]) =>
        [...new Set(tags.map((t) => FOOD_TO_CATEGORY[t.id]).filter(Boolean))];
      await onSubmit({
        restrictions,
        enjoyCategories: toCategories(enjoyTags),
        avoidCategories: toCategories(controlledAvoidTags),
      });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="screen-pref">
      <h1 className="screen-pref__title">Almost there.</h1>
      <p className="screen-pref__subtitle">These become hard constraints in your plan.</p>

      <div className="screen-pref__sections">
        {/* Dietary restrictions */}
        <div className="pref-section">
          <label className="field-label">Any dietary requirements?</label>
          <div className="pill-grid">
            {DIETARY_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`pill-btn${restrictions.includes(opt.id) ? ' pill-btn--active' : ''}`}
                onClick={() => toggleRestriction(opt.id)}
                aria-pressed={restrictions.includes(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Food preferences */}
        <div className="pref-section">
          <TagInput
            label="Foods I enjoy"
            placeholder="e.g. chicken, rice, eggs..."
            defaultTags={[]}
            maxTags={10}
            suggestions={ENJOY_SUGGESTIONS}
            onChange={(tags) => setEnjoyTags(tags)}
          />
        </div>

        <div className="pref-section">
          <TagInput
            label="Foods I avoid"
            placeholder="e.g. nuts, shellfish, pork..."
            defaultTags={[]}
            maxTags={10}
            suggestions={AVOID_SUGGESTIONS}
            controlledTags={controlledAvoidTags}
            onChange={(tags) => {
              // Store only user-added tags (not auto-populated ones)
              setAvoidTags(tags.filter((t) => !autoAvoidIds.has(t.id)));
            }}
          />
        </div>
      </div>

      <div className="screen-pref__submit">
        <button
          type="button"
          className={`btn--submit${isSubmitting ? ' btn--submit--busy' : ''}`}
          onClick={handleSubmit}
          disabled={isSubmitting}
          style={isSubmitting ? { opacity: 0.75 } : undefined}
        >
          <span style={{ color: '#ffffff' }}>
            {isSubmitting ? 'Optimising your plan...' : 'Build My Plan \u2192'}
          </span>
        </button>
        <div id="lottie-spinner" className={`submit-spinner${isSubmitting ? ' submit-spinner--visible' : ''}`} aria-hidden="true" />
      {(submitError || error) && (
        <p className="screen-pref__error">{submitError ?? error}</p>
      )}
      </div>

      <div className="screen-pref__back">
        <button type="button" className="btn btn--ghost" onClick={onBack} disabled={isSubmitting}>
          Back
        </button>
      </div>
    </div>
  );
}
