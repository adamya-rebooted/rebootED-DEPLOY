package rebootedmvp.domain.impl;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "boolean_entry")
public class BooleanEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Boolean value;

    @ManyToOne
    @JoinColumn(name = "pair_id", nullable = false)
    private PairImpl pair;

    public BooleanEntry() {
    }

    public BooleanEntry(Boolean value) {
        this.value = value;
    }

    public Long getId() {
        return id;
    }

    public Boolean getValue() {
        return value;
    }

    public void setValue(Boolean value) {
        this.value = value;
    }

    public PairImpl getPair() {
        return pair;
    }

    public void setPair(PairImpl pair) {
        this.pair = pair;
    }
}
